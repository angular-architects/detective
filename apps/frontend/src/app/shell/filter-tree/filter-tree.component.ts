import { CdkMenuModule } from '@angular/cdk/menu';
import { CdkTree } from '@angular/cdk/tree';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { combineLatest, of } from 'rxjs';

import { ConfigService } from '../../data/config.service';
import { FolderService } from '../../data/folder.service';
import { initConfig } from '../../model/config';
import { Folder } from '../../model/folder';
import { EventService } from '../../utils/event.service';

const MIN_OPEN_LEVEL = 2;

@Component({
  selector: 'app-filter-tree',
  standalone: true,
  imports: [
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    CdkMenuModule,
  ],
  templateUrl: './filter-tree.component.html',
  styleUrl: './filter-tree.component.css',
})
export class FilterTreeComponent implements OnInit {
  private folderService = inject(FolderService);
  private configService = inject(ConfigService);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);

  tree = viewChild.required<CdkTree<Folder>>(CdkTree);
  dataSource = new MatTreeNestedDataSource<Folder>();

  config = initConfig;
  selected = new Set<string>();
  folders: Folder[] = [];

  childrenAccessor = ({ folders }: Folder) => of(folders);
  hasChild = (_: number, { folders }: Folder) => !!folders?.length;

  ngOnInit(): void {
    const folders$ = this.folderService.load();
    const config$ = this.configService.load();
    combineLatest({
      folders: folders$,
      config: config$,
    }).subscribe(({ folders, config }) => {
      const focusFolder = this.findFolder(folders, config.focus);
      this.dataSource.data = focusFolder ? [focusFolder] : folders;
      this.config = config;
      this.folders = folders;
      this.selected.clear();
      this.config.scopes.forEach((scope) => this.selected.add(scope));
      this.expandChecked(this.dataSource.data);
      removeFocus();
    });
  }

  private findFolder(folders: Folder[], focus?: string): Folder | undefined {
    if (!focus || !folders?.length) return undefined;
    return (
      folders.find((folder) => folder && folder.path === focus) ??
      this.findFolder(
        folders.flatMap(({ folders }) => folders),
        focus
      )
    );
  }

  expandChecked(folders: Folder[], depth = 0): boolean {
    let open = depth <= MIN_OPEN_LEVEL;
    for (const folder of folders) {
      if (this.selected.has(folder.path)) {
        open = true;
      }
      if (folder.folders && this.expandChecked(folder.folders, depth + 1)) {
        this.tree().expand(folder);
        open = true;
      }
    }
    return open;
  }

  noContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  onContextMenu(event: MouseEvent, trigger: MatMenuTrigger) {
    event.preventDefault();
    trigger.openMenu();
    document
      .querySelector('div.cdk-overlay-backdrop')
      ?.addEventListener('mousedown', () => {
        trigger.closeMenu();
      });
    removeFocus();
  }

  selectChildren(folder: Folder) {
    this.deselectParents(folder);
    this.selected.delete(folder.path);
    for (const child of folder.folders) {
      this.selected.add(child.path);
    }
    this.tree().expand(folder);
    this.updateConfig();
  }

  focusTree(folder?: Folder) {
    this.dataSource = new MatTreeNestedDataSource<Folder>();
    this.dataSource.data = folder ? [{ ...folder }] : this.folders;
    this.config.focus = folder?.path;
    this.expandChecked(this.dataSource.data);
    this.tree().renderNodeChanges(this.dataSource.data);
    this.updateConfig();
  }

  isChecked({ path }: Folder): boolean {
    return this.selected.has(path);
  }

  hasFocus({ path }: Folder): boolean {
    return path === this.config.focus;
  }

  onCheckChange(folder: Folder, $event: MatCheckboxChange) {
    if ($event.checked) {
      this.selected.add(folder.path);
    } else {
      this.selected.delete(folder.path);
    }

    this.deselectParents(folder);
    this.deselectSubtree(folder.folders);
    this.updateConfig();
  }

  private updateConfig() {
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

  private deselectSubtree(folders: Folder[]) {
    for (const folder of folders) {
      this.selected.delete(folder.path);
      this.deselectSubtree(folder.folders || []);
    }
  }

  private findParents(): string[] {
    const parents: string[] = [];
    this._findParents(this.folders, parents);
    return parents;
  }

  private _findParents(folders = this.folders, parents: string[]): boolean {
    let selected = false;
    for (const folder of folders) {
      if (this.selected.has(folder.path)) {
        selected = true;
      } else {
        const selectedBelow = this._findParents(folder.folders || [], parents);
        if (selectedBelow) {
          parents.push(folder.path);
          selected = true;
        }
      }
    }
    return selected;
  }
}

function removeFocus() {
  setTimeout(() => {
    (document.activeElement as HTMLElement)?.blur();
  });
}
