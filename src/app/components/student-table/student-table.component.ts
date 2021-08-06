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
  mutation ($studentId: Int!) {
    removeStudent(id: $studentId) {
      __typename
    }
  }
`;
interface student {}
const CREATE_STUDENT = gql`
  mutation ($name: String!, $email: String!, $dob: String!) {
    createStudent(
      createStudentInput: { name: $name, email: $email, dob: $dob }
    ) {
      __typename
    }
  }
`;

const UPDATE_STUDENT = gql`
  mutation ($id: Int!, $name: String!, $email: String!, $dob: String!) {
    updateStudent(
      updateStudentInput: { id: $id, name: $name, email: $email, dob: $dob }
    ) {
      __typename
    }
  }
`;
@Component({
  selector: 'app-student-table',
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
})
export class StudentTableComponent implements OnInit {
  public pageSize = 10;
  public skip = 0;
  public opened = false;
  items: Student[] = [];
  form!: FormGroup;

  public uploadRemoveUrl = 'removeUrl';
  public uploadSaveUrl = 'saveUrl';

  public formGroup!: FormGroup;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    console.log('running fetch');
    this.apollo
      .watchQuery<any>({
        query: GET_STUDENTS,
      })
      .valueChanges.subscribe(({ data, loading }) => {
        this.items = data.student;
      });
  }

  public close() {
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }

  public editHandler({
    sender,
    rowIndex,
    dataItem,
  }: {
    sender: any;
    rowIndex: any;
    dataItem: any;
  }) {
    // define all editable fields validators and default values

    this.formGroup = new FormGroup({
      name: new FormControl(dataItem.name, Validators.required),
      email: new FormControl(dataItem.email, Validators.required),
      dob: new FormControl(dataItem.dob, Validators.required),
      id: new FormControl(dataItem.id, Validators.required),
    });

    // put the row in edit mode, with the `FormGroup` build above
    sender.editRow(rowIndex, this.formGroup);
  }

  public async saveHandler({
    sender,
    rowIndex,
    formGroup,
    isNew,
  }: {
    sender: any;
    rowIndex: any;
    formGroup: any;
    isNew: any;
  }) {
    console.log(isNew);

    if (isNew) {
      console.log('inside create');
      await this.apollo
        .mutate({
          mutation: CREATE_STUDENT,
          variables: {
            name: this.formGroup.value.name,
            email: this.formGroup.value.email,
            dob: this.formGroup.value.dob,
          },
        })
        .subscribe((value) => {
          this.fetchData();
        });

      await this.fetchData();

      sender.closeRow(rowIndex);
    } else {
      await this.apollo
        .mutate({
          mutation: UPDATE_STUDENT,
          variables: {
            id: this.formGroup.value.id,
            name: this.formGroup.value.name,
            email: this.formGroup.value.email,
            dob: this.formGroup.value.dob,
          },
        })
        .subscribe((value) => {
          console.log('inside subscribe', value);
          this.fetchData();
          console.log('after subscribe');
        });

      await this.fetchData();

      sender.closeRow(rowIndex);
    }
  }

  public cancelHandler({ sender, rowIndex }: { sender: any; rowIndex: any }) {
    // close the editor for the given row
    sender.closeRow(rowIndex);
  }

  public addHandler({ sender }: { sender: any }) {
    // define all editable fields validators and default values
    this.formGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      dob: new FormControl('', Validators.required),
      id: new FormControl(0, Validators.required),
    });

    // show the new row editor, with the `FormGroup` build above
    sender.addRow(this.formGroup);
  }

  public removeHandler({
    dataItem,
    sender,
    rowIndex,
  }: {
    dataItem: any;
    sender: any;
    rowIndex: any;
  }) {
    this.apollo
      .mutate({
        mutation: DELETE,
        variables: {
          studentId: dataItem.id,
        },
      })
      .subscribe((value) => {
        this.fetchData();
      });

    this.fetchData();

    sender.closeRow(rowIndex);
  }
}
