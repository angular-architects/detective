import { Component, inject, OnInit } from '@angular/core';
import { TeamAlignmentService } from './team-alignment.service';
import { TeamAlignmentResult } from './team-alignment-result';
import { Chart, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { DoughnutController } from 'chart.js';
import * as d3 from 'd3';
import { EventService } from '../event.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

Chart.register(ArcElement, Tooltip, Legend, Title, DoughnutController);

type TeamAlignmentChart = Chart<'doughnut', number[], string>;

@Component({
  selector: 'app-team-alignment',
  standalone: true,
  imports: [],
  templateUrl: './team-alignment.component.html',
  styleUrl: './team-alignment.component.css',
})
export class TeamAlignmentComponent implements OnInit {
  private taService = inject(TeamAlignmentService);
  private eventService = inject(EventService);

  colors: string[] = [];
  teams: string[] = [];
  charts: TeamAlignmentChart[] = [];

  constructor() {
    this.eventService.filterChanged.pipe(takeUntilDestroyed()).subscribe(() => {
      this.removeDiagrams();
      this.loadAndDraw();
    });
  }

  ngOnInit(): void {
    this.loadAndDraw();
  }

  private loadAndDraw() {
    const placeholder = document.getElementById('placeholder');

    this.taService.load().subscribe((result) => {
      this.colors = d3.quantize(d3.interpolateRainbow, result.teams.length + 1);
      this.teams = result.teams;

      this.charts = draw(result, placeholder, this.colors);
      window.onresize = () => {
        this.redraw(placeholder, result);
      };
    });
  }

  private redraw(placeholder: HTMLElement, result: TeamAlignmentResult) {
    this.removeDiagrams();
    this.charts = draw(result, placeholder, this.colors);
  }

  private removeDiagrams() {
    const placeholder = document.getElementById('placeholder');
    placeholder.innerHTML = '';
    this.charts.forEach((c) => c.destroy());
  }
}

function draw(
  result: TeamAlignmentResult,
  placeholder: HTMLElement,
  colors: string[]
): TeamAlignmentChart[] {
  const charts: TeamAlignmentChart[] = [];

  const moduleNames = Object.keys(result.modules);
  const teams = result.teams;

  for (const moduleName of moduleNames) {
    const module = result.modules[moduleName];

    const label = moduleName.split('/').at(-1);

    const container = document.createElement('div');
    container.classList.add('ta-container');
    placeholder.appendChild(container);

    const canvas = document.createElement('canvas');
    canvas.classList.add('ta-diagram');
    container.appendChild(canvas);

    const data = teams.map((t) => module.changes[t]);
    const sum = data.reduce((acc, curr) => acc + (curr || 0), 0);

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: teams,
        datasets: [
          {
            // label,
            data,
            borderWidth: 1,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: label,
            font: {
              size: 18, // Schriftgröße des Titels festlegen
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = ' ' + context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.raw !== null) {
                  label += Math.round(((context.raw as any) / sum) * 100) + '%';
                }
                return label;
              },
            },
          },
        },
      },
    });

    charts.push(chart);
  }
  return charts;
}
