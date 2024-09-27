import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Limits, LimitType } from '../../model/limits';

interface Option {
  id: LimitType;
  label: string;
}

const initCommits = 1000;
const initMonths = 12;

@Component({
  selector: 'app-limits',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatTooltipModule,
  ],
  providers: [DecimalPipe],
  templateUrl: './limits.component.html',
  styleUrl: './limits.component.css',
})
export class LimitsComponent {
  limits = model.required<Limits>();
  totalCommits = input<number>(0);

  decimal = inject(DecimalPipe);

  commitToolTip = computed(() => {
    const totalCommits = this.totalCommits();
    if (totalCommits) {
      return this.decimal.transform(totalCommits) + ' total commits';
    }
    return '';
  });

  optionChanged(option: LimitType) {
    if (option === 'COMMITS') {
      this.limits.set({
        limitCommits: initCommits,
        limitMonths: 0,
        limitType: 'COMMITS',
      });
    } else {
      this.limits.set({
        limitCommits: 0,
        limitMonths: initMonths,
        limitType: 'MONTHS',
      });
    }
  }

  update(commits: number, months: number): void {
    this.limits.update((limits) => ({
      ...limits,
      limitCommits: commits,
      limitMonths: months,
    }));
  }

  options: Option[] = [
    { id: 'COMMITS', label: 'Limit Commits' },
    { id: 'MONTHS', label: 'Limit by Date' },
  ];
}
