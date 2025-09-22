import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TeamAlignmentStore } from '../team-alignment.store';

export interface BusFactorEntry {
  module: string;
  primaryContributor: string;
  primaryPercentage: number;
  secondaryContributor: string;
  secondaryPercentage: number;
  busFactor: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-bus-factor-report',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './bus-factor-report.component.html',
  styleUrl: './bus-factor-report.component.css',
})
export class BusFactorReportComponent {
  private taStore = inject(TeamAlignmentStore);
  dialogRef = inject(DialogRef);

  isTeamMode = computed(() => {
    const result = this.taStore.result();
    return (
      result.teams.length > 0 &&
      result.teams.some((team) => team.startsWith('Team'))
    );
  });

  busFactorData = computed(() => {
    const result = this.taStore.result();
    const entries: BusFactorEntry[] = [];

    for (const [moduleName, moduleDetails] of Object.entries(result.modules)) {
      const contributors = Object.entries(moduleDetails.changes).sort(
        (a, b) => b[1] - a[1]
      );

      if (contributors.length === 0) continue;

      const totalChanges = contributors.reduce(
        (sum, [_, changes]) => sum + changes,
        0
      );

      const primaryContributor = contributors[0] || ['', 0];
      const secondaryContributor = contributors[1] || ['-', 0];

      const primaryPercentage = (primaryContributor[1] / totalChanges) * 100;
      const secondaryPercentage = secondaryContributor[1]
        ? (secondaryContributor[1] / totalChanges) * 100
        : 0;

      const busFactor = this.calculateBusFactor(contributors, totalChanges);
      const riskLevel = this.determineRiskLevel(busFactor, primaryPercentage);

      entries.push({
        module: moduleName,
        primaryContributor: primaryContributor[0],
        primaryPercentage,
        secondaryContributor: secondaryContributor[0] || '-',
        secondaryPercentage,
        busFactor,
        riskLevel,
      });
    }

    return entries.sort((a, b) => {
      const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
  });

  private calculateBusFactor(
    contributors: [string, number][],
    totalChanges: number
  ): number {
    if (contributors.length === 0) return 0;

    let accumulatedChanges = 0;
    let contributorCount = 0;

    // Calculate how many contributors make up 50% of changes
    for (const [, changes] of contributors) {
      accumulatedChanges += changes;
      contributorCount++;
      if (accumulatedChanges >= totalChanges * 0.5) {
        break;
      }
    }

    return contributorCount;
  }

  private determineRiskLevel(
    busFactor: number,
    primaryPercentage: number
  ): 'Critical' | 'High' | 'Medium' | 'Low' {
    if (busFactor === 1 && primaryPercentage >= 80) return 'Critical';
    if (busFactor === 1 || primaryPercentage >= 70) return 'High';
    if (busFactor === 2) return 'Medium';
    return 'Low';
  }

  exportToCSV(): void {
    const data = this.busFactorData();
    const headers = [
      'Module',
      'Primary Contributor',
      '% of Changes',
      'Secondary Contributor',
      '% of Changes',
      'Bus Factor',
      'Risk Level',
    ];

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row.module,
          row.primaryContributor,
          row.primaryPercentage.toFixed(1) + '%',
          row.secondaryContributor,
          row.secondaryPercentage > 0
            ? row.secondaryPercentage.toFixed(1) + '%'
            : '-',
          row.busFactor,
          row.riskLevel,
        ]
          .map((field) => `"${field}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bus-factor-report-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  close(): void {
    this.dialogRef.close();
  }
}
