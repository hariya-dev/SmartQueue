import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { StatisticsDto, StatisticsQueryRequest, Service, HourlyStatisticsDto } from '../../../core/models';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    TableModule,
    ButtonModule,
    DatePickerModule,
    SelectModule
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {
  stats: StatisticsDto[] = [];
  hourlyStats: HourlyStatisticsDto[] = [];
  services: Service[] = [];
  loading = false;
  exporting = false;

  // Filters
  startDate: Date = new Date();
  endDate: Date = new Date();
  selectedServiceId?: number;

  // Summary
  summary = {
    total: 0,
    done: 0,
    missed: 0,
    avgWait: 0,
    donePercent: 0,
    missedPercent: 0
  };

  // Chart Data
  statusData: any;
  statusOptions: any;
  trendData: any;
  trendOptions: any;
  serviceData: any;
  serviceOptions: any;
  hourlyData: any;
  hourlyOptions: any;

  constructor(private apiService: ApiService) {
    // Set default range to last 7 days
    const start = new Date();
    start.setDate(start.getDate() - 7);
    this.startDate = start;
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadStatistics();
    this.initChartOptions();
  }

  loadServices(): void {
    this.apiService.getServices(false).subscribe(data => {
      this.services = data;
    });
  }

  loadStatistics(): void {
    this.loading = true;
    const request: StatisticsQueryRequest = {
      startDate: this.formatDate(this.startDate),
      endDate: this.formatDate(this.endDate),
      serviceId: this.selectedServiceId
    };

    this.apiService.getStatistics(request).subscribe(data => {
      this.stats = data;
      this.calculateSummary();
      this.updateCharts();
    });

    this.apiService.getHourlyStatistics(request)
      .pipe(finalize(() => this.loading = false))
      .subscribe(data => {
        this.hourlyStats = data;
        this.updateHourlyChart();
      });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  calculateSummary(): void {
    const totalProcessed = this.stats.reduce((acc, s) => acc + s.totalProcessed, 0);
    const totalPassed = this.stats.reduce((acc, s) => acc + s.totalPassed, 0);
    const totalCancelled = this.stats.reduce((acc, s) => acc + s.totalCancelled, 0);
    const totalTickets = totalProcessed + totalPassed + totalCancelled;
    
    const avgWait = this.stats.length > 0 
      ? Math.round(this.stats.reduce((acc, s) => acc + s.avgWaitTimeSeconds, 0) / this.stats.length / 60) 
      : 0;

    this.summary = {
      total: totalTickets,
      done: totalProcessed,
      missed: totalPassed + totalCancelled,
      avgWait: avgWait,
      donePercent: totalTickets > 0 ? Math.round((totalProcessed / totalTickets) * 100) : 0,
      missedPercent: totalTickets > 0 ? Math.round(((totalPassed + totalCancelled) / totalTickets) * 100) : 0
    };
  }

  initChartOptions(): void {
    this.statusOptions = {
      plugins: {
        legend: { position: 'bottom' }
      },
      cutout: '60%'
    };

    this.trendOptions = {
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        y: { beginAtZero: true, grid: { drawBorder: false } },
        x: { grid: { display: false } }
      }
    };

    this.serviceOptions = {
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true },
        y: { grid: { display: false } }
      }
    };

    this.hourlyOptions = {
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } }
      }
    };
  }

  updateCharts(): void {
    // Status Chart
    const totalDone = this.stats.reduce((acc, s) => acc + s.totalProcessed, 0);
    const totalPassed = this.stats.reduce((acc, s) => acc + s.totalPassed, 0);
    const totalCancelled = this.stats.reduce((acc, s) => acc + s.totalCancelled, 0);

    this.statusData = {
      labels: ['Thành công', 'Bỏ lượt', 'Hủy'],
      datasets: [{
        data: [totalDone, totalPassed, totalCancelled],
        backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
        hoverBackgroundColor: ['#16A34A', '#D97706', '#DC2626']
      }]
    };

    // Trend Chart (group by date)
    const dates = [...new Set(this.stats.map(s => this.formatDate(new Date(s.date))))].sort();
    const trendValues = dates.map(d => {
      return this.stats
        .filter(s => this.formatDate(new Date(s.date)) === d)
        .reduce((acc, s) => acc + s.totalProcessed + s.totalPassed + s.totalCancelled, 0);
    });

    this.trendData = {
      labels: dates.map(d => d.split('-').reverse().slice(0, 2).join('/')),
      datasets: [{
        label: 'Số lượt lấy số',
        data: trendValues,
        fill: true,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    };

    // Service Chart
    const servicesMap = new Map<string, number>();
    this.stats.forEach(s => {
      const count = s.totalProcessed + s.totalPassed + s.totalCancelled;
      servicesMap.set(s.serviceCode, (servicesMap.get(s.serviceCode) || 0) + count);
    });

    const sortedServices = [...servicesMap.entries()].sort((a, b) => b[1] - a[1]);

    this.serviceData = {
      labels: sortedServices.map(x => x[0]),
      datasets: [{
        label: 'Số lượt',
        data: sortedServices.map(x => x[1]),
        backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#10B981', '#F59E0B'],
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  }

  updateHourlyChart(): void {
    this.hourlyData = {
      labels: this.hourlyStats.map(h => `${h.hour}h`),
      datasets: [
        {
          label: 'Tổng số phiếu',
          data: this.hourlyStats.map(h => h.totalTickets),
          backgroundColor: '#3B82F6',
          borderRadius: 4
        },
        {
          label: 'Thành công',
          data: this.hourlyStats.map(h => h.totalProcessed),
          backgroundColor: '#22C55E',
          borderRadius: 4
        }
      ]
    };
  }

  exportToExcel(): void {
    this.exporting = true;
    const request: StatisticsQueryRequest = {
      startDate: this.formatDate(this.startDate),
      endDate: this.formatDate(this.endDate),
      serviceId: this.selectedServiceId
    };

    this.apiService.exportStatistics(request)
      .pipe(finalize(() => this.exporting = false))
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bao_cao_QMS_${this.formatDate(new Date())}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  }
}
