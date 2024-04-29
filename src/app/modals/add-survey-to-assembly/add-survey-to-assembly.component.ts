import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { AssembliesComponent } from '../../pages/assemblies/assemblies.component';
import { SurveyData } from '../../pages/surveys/surveys.component';

@Component({
  selector: 'app-add-survey-to-assembly',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatCheckboxModule, MatInputModule],
  templateUrl: './add-survey-to-assembly.component.html',
  styleUrl: './add-survey-to-assembly.component.css'
})

export class AddSurveyToAssemblyComponent {
  constructor(
    public dialogRef: MatDialogRef<AssembliesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { surveys: SurveyData[], selected: number[] }) { }

  toggleSelection(surveyId: number): void {
    const index = this.data.selected.indexOf(surveyId);
    if (index > -1) {
      this.data.selected.splice(index, 1);
    } else {
      this.data.selected.push(surveyId);
    }
  }

  closeDialog(): void {
    this.dialogRef.close(this.data.selected);
  }
}
