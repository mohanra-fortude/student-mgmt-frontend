import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Student } from 'src/app/Student';
const GET_STUDENTS = gql`
  query {
    student {
      id
      name
      age
      email
      dob
    }
  }
`;
const DELETE = gql`
  mutation ($studentId: String!) {
    removeStudent(id: $studentId) {
      __typename
    }
  }
`;
interface student {}
const CREATE_STUDENT = gql`
  mutation ($name: String!, $email: String!, $dateofbirth: DateTime!) {
    createStudent(
      createStudentInput: {
        name: $name
        email: $email
        dateofbirth: $dateofbirth
      }
    ) {
      id
      name
      email
      dateofbirth
      age
    }
  }
`;
@Component({
  selector: 'app-student-table',
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
})
export class StudentTableComponent implements OnInit {
  public gridView!: GridDataResult;
  public pageSize = 10;
  public skip = 0;
  public opened = false;
  items: Student[] = [];
  form!: FormGroup;
  userData = {
    name: '',
    email: '',
    dateofbirth: '',
  };
  public uploadRemoveUrl = 'removeUrl';
  public uploadSaveUrl = 'saveUrl';
  constructor(private apollo: Apollo) {
    this.loadItems();
    this.form = new FormGroup({
      name: new FormControl(this.userData.name, [Validators.required]),
      email: new FormControl(this.userData.email, [Validators.required]),
      dateofbirth: new FormControl(this.userData.dateofbirth, [
        Validators.required,
      ]),
    });
  }

  ngOnInit(): void {
    this.apollo
      .watchQuery<any>({
        query: GET_STUDENTS,
      })
      .valueChanges.subscribe(({ data, loading }) => {
        this.items = data.student;
        console.log(this.items);
      });
  }
  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadItems();
  }

  private loadItems(): void {
    this.gridView = {
      data: this.items.slice(this.skip, this.skip + this.pageSize),
      total: this.items.length,
    };
  }
  public close() {
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }
  removeHandler(id: any) {
    this.apollo
      .mutate({
        mutation: DELETE,
        variables: {
          studentId: id.dataItem.id,
        },
      })
      .subscribe(() => {
        this.items = this.items.filter((i) => i.id !== id.dataItem.id);
      });
  }

  public submitForm(): void {
    this.apollo
      .mutate({
        mutation: CREATE_STUDENT,
        variables: {
          name: this.form.value.name,
          email: this.form.value.email,
          dateofbirth: this.form.value.dateofbirth,
        },
      })
      .subscribe();
    this.close();
  }

  public clearForm(): void {
    this.form.reset();
  }
}
