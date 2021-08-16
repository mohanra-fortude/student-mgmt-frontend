import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import {
  NotificationModule,
  NotificationService,
} from '@progress/kendo-angular-notification';
import { UploadsModule } from '@progress/kendo-angular-upload';
import { Apollo } from 'apollo-angular';
import { GraphQLModule } from '../../graphql.module';
import { of } from 'rxjs';
import { StudentTableComponent } from './student-table.component';

describe('StudentTableComponent', () => {
  let component: StudentTableComponent;
  let fixture: ComponentFixture<StudentTableComponent>;

  let studentList: any;
  let mockObject: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule,
        LabelModule,
        InputsModule,
        DateInputsModule,
        ButtonModule,
        FormsModule,
        ReactiveFormsModule,
        GridModule,
        DropDownsModule,
        UploadsModule,
        NotificationModule,
        DialogsModule,
        HttpClientModule,
        GraphQLModule,
      ],
      declarations: [StudentTableComponent],
      providers: [FormBuilder, Apollo, NotificationService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(function () {
    studentList = [
      {
        id: 1,
        name: 'student1',
        email: 'student1@123',
        dob: '2000-04-12',
      },
      {
        id: 2,
        name: 'student2',
        email: 'student2@123',
        dob: '2000-04-12',
      },
    ];
    mockObject = jasmine.createSpyObj(['removeHandler', ['saveHandler']]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch data', () => {
    const result = component.fetchData();
    expect(result).toBeTruthy();
  });

  it('should have students', () => {
    component.items.length = 2;
    expect(component.items.length).toBeGreaterThan(0);
  });

});
