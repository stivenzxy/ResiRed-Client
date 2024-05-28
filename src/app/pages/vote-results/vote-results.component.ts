import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ManageAssembliesService } from '../../services/assembly/manage-assemblies.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vote-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vote-results.component.html',
  styleUrls: ['./vote-results.component.css']
})
export class VoteResultsComponent implements OnInit, AfterViewInit {
  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  results: any[] = [];
  finishedAssembly?: any;
  assemblyStatus?: any;
  currentTopicIndex: number = 0;
  currentQuestionIndex: number = 0;
  charts: Chart[] = []; // Almacena las instancias de Chart.js

  constructor(private assemblyService: ManageAssembliesService, private router: Router) { 
    // Registra todos los componentes de Chart.js
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadFinishedAssembly();
  }

  ngAfterViewInit(): void {
    this.chartCanvases.changes.subscribe(() => {
      this.generateCharts();
    });
  }

  loadFinishedAssembly() {
    this.assemblyService.getFinishedAssembly().subscribe({
      next: (data) => {
        this.finishedAssembly = data;
        console.log('finishedAssembly:', this.finishedAssembly);
        if (this.finishedAssembly) {
          this.getAssemblyStatus(this.finishedAssembly.assemblyId);
          this.assemblyService.VoteResults(this.finishedAssembly.assemblyId).subscribe(data => {
            this.results = data;
            this.generateCharts();
          });
        }
      },
      error: (error) => {
        console.error('Error loading assembly in progress:', error);
      }
    });
  }

  getAssemblyStatus(assemblyId: number) {
    if (!assemblyId) return;

    this.assemblyService.getAssemblyStatus(assemblyId).subscribe({
      next: (status) => {
        this.assemblyStatus = status;
        console.log('Assembly status:', this.assemblyStatus);
      },
      error: (err) => {
        console.error('Error getting assembly status:', err);
      }
    });
  }

  generateCharts(): void {
    // Destruye las instancias anteriores de los gráficos
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    if (!this.chartCanvases || !this.chartCanvases.length) {
      return;
    }

    let canvasIndex = 0;

    const topic = this.results[this.currentTopicIndex];
    const question = topic.questions[this.currentQuestionIndex];

    const canvasElement = this.chartCanvases.toArray()[canvasIndex]?.nativeElement;
    if (!canvasElement) {
      return;
    }

    const context = canvasElement.getContext('2d');

    const labels = question.choices.map((c: any) => c.description);
    const data = question.choices.map((c: any) => c.votes);

    const gradient = this.createGradient(context!, canvasIndex);

    const chartConfig: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: question.description,
          data,
          backgroundColor: gradient
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    };

    this.charts.push(new Chart(context!, chartConfig));
  }

  createGradient(context: CanvasRenderingContext2D, index: number): CanvasGradient {
    const gradient = context.createLinearGradient(0, 0, 0, 200);
    const colors = [
      ['#3D258A', '#258A7F'],
      ['#36A2EB', '#4BC0C0'],
      ['#FFCE56', '#9966FF']
    ];
    const selectedColors = colors[index % colors.length];
    gradient.addColorStop(0, selectedColors[0]);
    gradient.addColorStop(1, selectedColors[1]);
    return gradient;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.results[this.currentTopicIndex].questions.length - 1) {
      this.currentQuestionIndex++;
    } else if (this.currentTopicIndex < this.results.length - 1) {
      this.currentTopicIndex++;
      this.currentQuestionIndex = 0;
    } else {
      this.router.navigate(['dashboard']);
    }
    this.generateCharts();
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    } else if (this.currentTopicIndex > 0) {
      this.currentTopicIndex--;
      this.currentQuestionIndex = this.results[this.currentTopicIndex].questions.length - 1;
    }
    this.generateCharts();
  }

  isLastQuestion(): boolean {
    return this.currentTopicIndex === this.results.length - 1 && this.currentQuestionIndex === this.results[this.currentTopicIndex].questions.length - 1;
  }

  dashboard(){
    this.router.navigate(['dashboard']);
  }
}
