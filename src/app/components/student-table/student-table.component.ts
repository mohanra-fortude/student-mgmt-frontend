import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Student } from 'src/app/Student';
import { NotificationService } from '@progress/kendo-angular-notification';
import { request } from 'graphql-request';

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
  items: Student[] = [];
  public file = '';
  public formGroup!: FormGroup;
  public pageSize = 10;
  public skip = 0;
  public gridView!: GridDataResult;
  // public uploadRemoveUrl = 'http://localhost:3003/graphql';
  // public uploadSaveUrl = 'http://localhost:3003/graphql';

  constructor(
    private apollo: Apollo,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  public pageChange({ skip, take }: PageChangeEvent): void {
    this.skip = skip;
    this.pageSize = take;
    this.loadItems();
  }

  public loadItems(): void {
    this.gridView = {
      data: this.items.slice(this.skip, this.skip + this.pageSize),
      total: this.items.length,
    };
  }

  fetchData() {
    console.log('running fetch');

    this.apollo
      .watchQuery<any>({
        query: GET_STUDENTS,
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(({ data }) => {
        this.items = data.student;
        this.loadItems();
      });
    
    
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

  public saveHandler({
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
      this.apollo
        .mutate({
          mutation: CREATE_STUDENT,
          variables: {
            name: this.formGroup.value.name,
            email: this.formGroup.value.email,
            dob: this.formGroup.value.dob,
          },
        })
        .subscribe(() => {
          this.fetchData();
        });

      sender.closeRow(rowIndex);
    } else {
      this.apollo
        .mutate({
          mutation: UPDATE_STUDENT,
          variables: {
            id: this.formGroup.value.id,
            name: this.formGroup.value.name,
            email: this.formGroup.value.email,
            dob: this.formGroup.value.dob,
          },
        })
        .subscribe(() => {
          this.fetchData();
        });

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
      .subscribe(() => {
        this.DeleteNotification();
        this.fetchData();
      });

    sender.closeRow(rowIndex);
  }

  public DeleteNotification(): void {
    this.notificationService.show({
      content: 'Deleted Student',
      hideAfter: 600,
      position: { horizontal: 'center', vertical: 'top' },
      animation: { type: 'fade', duration: 400 },
      type: { style: 'error', icon: true },
    });
  }

  public onUpload(event: any) {
    var xhr = event.XMLHttpRequest;
    const file = event.files[0].rawFile;
    console.log(event, xhr);

    const uploadFileMutation = gql`
      mutation uploadFile($file: Upload!) {
        uploadFile(file: $file)
      }
    `;

    return request('http://localhost:3003/graphql', uploadFileMutation, {
      file: file,
    }).then((data) => {
      this.fetchData();
      return data;
    });

    // let isSuccess: boolean = false;

    // this.apollo
    //   .use('projectspec')
    //   .mutate<any>({
    //     mutation: uploadFileMutation,
    //     variables: {
    //       file: file,
    //     },
    //     context: {
    //       useMultipart: true,
    //     },
    //   })
    //   .subscribe(
    //     (result) => this.fetchData(),
    //     (err) => !isSuccess
    //   );
  }
}
