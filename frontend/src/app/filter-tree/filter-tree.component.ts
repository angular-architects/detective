import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Folder } from './folder';
import { CdkTree, CdkTreeModule } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FolderService } from './folder.service';
import { combineLatest, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { ConfigService } from './config.service';
import { initConfig } from './config';
import { EventService } from '../event.service';

@Component({
  selector: 'app-filter-tree',
  standalone: true,
  imports: [CdkTreeModule, MatIconModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './filter-tree.component.html',
  styleUrl: './filter-tree.component.css',
})
export class FilterTreeComponent implements OnInit {
  folderService = inject(FolderService);
  configService = inject(ConfigService);
  eventService = inject(EventService);

  @ViewChild(CdkTree)
  tree: CdkTree<Folder>;

  dataSource = new MatTreeNestedDataSource<Folder>();

  childrenAccessor = (folder: Folder) => of(folder.folders);

  selected = new Set<string>();

  config = initConfig;
  folders: Folder[] = [];

  ngOnInit(): void {
    const folders$ = this.folderService.load();
    const config$ = this.configService.load();
    combineLatest({
      folders: folders$,
      config: config$,
    }).subscribe((result) => {
      this.dataSource.data = result.folders;
      this.config = result.config;
      this.folders = result.folders;
      this.selected.clear();
      this.config.scopes.forEach((scope) => this.selected.add(scope));
      this.expandChecked(result.folders);
      (document.activeElement as any).blur();

    });
  }

  expandChecked(folders: Folder[]): boolean {
    let open = false;
    for (let folder of folders) {
      if (this.selected.has(folder.path)) {
        open = true;
      }
      if (folder.folders && this.expandChecked(folder.folders)) {
        this.tree.expand(folder);
        open = true;
      }
    }
    return open;
  }

  isChecked(folder: Folder): boolean {
    //console.log('isChecked', folder);
    return this.selected.has(folder.path);
    // return true;
  }

  onCheckChange(folder: Folder, $event: MatCheckboxChange) {
    //console.log('isChecked', folder, $event.checked);
    if ($event.checked) {
      this.selected.add(folder.path);
    } else {
      this.selected.delete(folder.path);
    }

    this.deselectParents(folder);
    this.deselectSubtree(folder.folders);

    this.config.scopes = [...this.selected];
    this.config.groups = this.findParents();

    this.configService.save(this.config).subscribe(() => {
      this.eventService.filterChanged.next();
    });
  }

  private deselectParents(folder: Folder) {
    const segments = folder.path.split('/');
    while (segments.length > 0) {
      segments.pop();
      this.selected.delete(segments.join('/'));
    }
  }

  deselectSubtree(folders: Folder[]) {
    for(const folder of folders) {
      this.selected.delete(folder.path);
      this.deselectSubtree(folder.folders || []);
    }
  }

  findParents(): string[] {
    const parents: string[] = [];
    this._findParents(this.folders, parents);
    return parents;
  }

  _findParents(folders = this.folders, parents: string[] ): boolean {
    let selected = false;
    for (const folder of folders) {
      if (this.selected.has(folder.path)) {
        selected = true;
      }
      else {
        const selectedBelow = this._findParents(folder.folders || [], parents);
        if (selectedBelow) {
          parents.push(folder.path);
          selected = true;
        }
      }
    }
    return selected;
  }

  hasChild = (_: number, node: Folder) =>
    !!node.folders && node.folders.length > 0;
}
