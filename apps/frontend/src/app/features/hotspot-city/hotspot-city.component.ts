import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { scan, startWith } from 'rxjs';

import { LimitsStore } from '../../data/limits.store';
import { StatusStore } from '../../data/status.store';
//
import { Limits } from '../../model/limits';
import { LimitsComponent } from '../../ui/limits/limits.component';
import { EventService } from '../../utils/event.service';
import type { ScoreType } from '../hotspot/hotspot-adapter';
import { HotspotDetailComponent } from '../hotspot/hotspot-detail/hotspot-detail.component';
import { HotspotStore } from '../hotspot/hotspot.store';
import { XRayDialogComponent } from '../trend-analysis/x-ray/x-ray-dialog.component';

import { City3DComponent } from './city3d.component';
import { City3DBoundaries, City3DItem, City3DMeta } from './city3d.types';
import { HotspotCityStore } from './hotspot-city.store';

@Component({
  selector: 'app-hotspot-city',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSliderModule,
    MatIconModule,
    MatTooltipModule,
    LimitsComponent,
    City3DComponent,
  ],
  templateUrl: './hotspot-city.component.html',
  styleUrl: './hotspot-city.component.css',
  providers: [HotspotCityStore],
})
export class HotspotCityComponent {
  hoverEl = viewChild<ElementRef<HTMLDivElement>>('hoverEl');
  containerEl = viewChild<ElementRef<HTMLDivElement>>('containerEl');

  private dialog = inject(MatDialog);
  private limitsStore = inject(LimitsStore);
  private statusStore = inject(StatusStore);
  protected store = inject(HotspotCityStore);
  private hotspotStore = inject(HotspotStore);
  private eventService = inject(EventService);
  private filterChangedSig = toSignal(
    this.eventService.filterChanged.pipe(
      startWith(0),
      scan((acc) => acc + 1, 0)
    ),
    { initialValue: 0 }
  );
  protected byFile = signal(false);

  hoverVisible = signal(false);
  hoverX = signal(0);
  hoverY = signal(0);
  hoverTitle = signal('');
  hoverMetrics = signal<string[]>([]);

  // controls bindings
  totalCommits = this.statusStore.commits;
  limits = this.limitsStore.limits;

  // derived inputs for 3D component
  items = signal<City3DItem[]>([]);
  boundaries = signal<City3DBoundaries | undefined>(undefined);

  constructor() {
    effect(
      () => {
        const byFile = this.byFile();
        if (byFile) {
          const hotspots = this.store.hotspotData();
          const mapped: City3DItem[] = hotspots.map((f) => ({
            id: f.fileName,
            label: f.fileName,
            footprint: f.loc,
            height: f.mcCabe,
            meta: {
              kind: 'file',
              filePath: f.fileName,
              folder: this.getLastSegment(this.dirname(f.fileName)),
              complexity: f.mcCabe,
              commits: f.commits,
              changedLines: f.changedLines,
              score: f.score,
            },
          }));
          mapped.sort((a, b) => a.label.localeCompare(b.label));
          this.items.set(mapped);
          this.boundaries.set(undefined);
        } else {
          const { aggregated, warningBoundary, hotspotBoundary, maxScore } =
            this.hotspotStore.aggregatedResult();
          const mapped: City3DItem[] = aggregated.map((a) => {
            const total = a.countOk + a.countWarning + a.countHotspot;
            const moduleKey = this.getModuleKey(a.parent, a.module);
            return {
              id: moduleKey,
              label: moduleKey,
              footprint: total,
              height: total,
              meta: {
                kind: 'module',
                moduleKey,
                parent: a.parent,
                module: a.module,
                countHotspot: a.countHotspot,
                countWarning: a.countWarning,
                countOk: a.countOk,
                total,
              },
            };
          });
          mapped.sort((a, b) => a.label.localeCompare(b.label));
          this.items.set(mapped);
          this.boundaries.set({ warningBoundary, hotspotBoundary, maxScore });
        }
      },
      { allowSignalWrites: true }
    );

    // Keep aggregated hotspots in sync while in module mode
    effect(
      () => {
        if (this.byFile()) return;
        // react to limits, minScore, selected metric and global filter changes
        const lim = this.limits();
        const min = this.store.minScore();
        const metric = this.hotspotStore.filter.metric();
        void this.filterChangedSig();
        this.hotspotStore.rxLoadAggregated({
          limits: lim,
          minScore: min,
          metric,
        });
      },
      { allowSignalWrites: true }
    );
  }

  updateLimits(limits: Limits): void {
    this.limitsStore.updateLimits(limits);
  }

  openFilterDocs(): void {
    window.open(
      'https://github.com/angular-architects/detective?tab=readme-ov-file#filtering-the-git-log',
      '_blank',
      'noopener'
    );
  }

  private dirname(path: string): string {
    const idx = path.lastIndexOf('/');
    return idx === -1 ? '' : path.substring(0, idx);
  }

  private getLastSegment(folder: string): string {
    if (!folder) return '';
    const parts = folder.split('/').filter((p) => p.length > 0);
    return parts.length ? parts[parts.length - 1] : folder;
  }

  private getModuleKey(parent: string, module: string): string {
    if (!parent) return module;
    // avoid duplicated prefix like parent/parent/module
    return module.startsWith(parent + '/') ? module : `${parent}/${module}`;
  }

  onHover(event: { meta: City3DMeta | null; x: number; y: number }): void {
    const meta = event.meta;
    if (!meta) {
      this.hoverVisible.set(false);
      return;
    }
    const container = this.containerEl()?.nativeElement;
    const tipEl = this.hoverEl()?.nativeElement;
    const rectW = container?.clientWidth ?? 600;
    const rectH = container?.clientHeight ?? 400;
    const tipW = tipEl?.offsetWidth ?? 260;
    const tipH = tipEl?.offsetHeight ?? 120;
    const left = Math.min(Math.max(8, event.x), rectW - tipW - 8);
    const top = Math.min(Math.max(8, event.y), rectH - tipH - 8);
    this.hoverX.set(left);
    this.hoverY.set(top);

    if (meta.kind === 'file') {
      this.hoverTitle.set(meta.filePath);
      this.hoverMetrics.set([
        `Folder: ${meta.folder}`,
        `Complexity: ${meta.complexity}`,
        `Commits: ${meta.commits}`,
        `Changed Lines: ${meta.changedLines}`,
        `Score: ${meta.score}`,
      ]);
    } else {
      this.hoverTitle.set(meta.moduleKey);
      this.hoverMetrics.set([
        `File Count`,
        `Hotspots: ${meta.countHotspot}`,
        `Warnings: ${meta.countWarning}`,
        `Fine: ${meta.countOk}`,
        `Total: ${meta.total}`,
      ]);
    }
    this.hoverVisible.set(true);
  }

  onBuildingClick(meta: City3DMeta): void {
    if (meta.kind === 'file') {
      this.dialog.open(XRayDialogComponent, {
        data: { filePath: meta.filePath },
        width: '95%',
        maxWidth: '900px',
      });
      return;
    }
    const selectedModule = meta.moduleKey;
    const agg = this.hotspotStore.aggregatedResult();
    const type: ScoreType =
      meta.countHotspot > 0
        ? 'hotspot'
        : meta.countWarning > 0
        ? 'warning'
        : 'fine';
    const range = [
      0,
      agg.warningBoundary,
      agg.hotspotBoundary,
      agg.maxScore + 1,
    ];
    const idx = type === 'fine' ? 0 : type === 'warning' ? 1 : 2;
    const scoreRange = { from: range[idx], to: range[idx + 1] };

    this.hotspotStore.rxLoadHotspots({
      limits: this.limits(),
      metric: this.hotspotStore.filter.metric(),
      selectedModule,
      scoreRange,
      scoreType: type,
    });

    this.dialog.open(HotspotDetailComponent, {
      width: '95%',
      height: '700px',
    });
  }
}
