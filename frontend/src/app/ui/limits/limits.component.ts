import { Component, model, signal } from '@angular/core';
import { Limits } from '../../model/limits';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

type OptionId = 'COMMITS' | 'MONTHS';

type Option = {
  id: OptionId;
  label: string;
};

const initCommits = 1000;
const initMonths = 12;

@Component({
  selector: 'app-limits',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule],
  templateUrl: './limits.component.html',
  styleUrl: './limits.component.css',
})
export class LimitsComponent {

  limits = model.required<Limits>();
  selected = signal<OptionId>('COMMITS');

  optionChanged(option: OptionId) {
    this.selected.set(option);
    if (option === 'COMMITS') {
      this.limits.set({
        limitCommits: initCommits,
        limitMonths: 0
      });
    }
    else {
      this.limits.set({
        limitCommits: 0,
        limitMonths: initMonths
      });
    }
  }

  update(commits: number, months: number): void {
    this.limits.set({
      limitCommits: commits,
      limitMonths: months,
    });
  }

  options: Option[] = [
    { id: 'COMMITS', label: 'Limit Commits' },
    { id: 'MONTHS', label: 'Limit by Date' },
  ];
}
