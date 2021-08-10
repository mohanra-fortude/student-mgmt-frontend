import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Student } from 'src/app/Student';
import { NotificationService } from '@progress/kendo-angular-notification';
import { StudentService } from 'src/app/services/student.service';

import * as SC from 'socketcluster-client';

let socket = SC.create({
  hostname: 'localhost',
  port: 8000,
});




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

  constructor(
    private apollo: Apollo,
    private notificationService: NotificationService,
    private studentService: StudentService
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

  async fetchData() {
    const query = await this.apollo.watchQuery<any>({
      query: gql`
        query {
          student {
            id
            name
            age
            email
            dob
          }
        }
      `,
      fetchPolicy: 'network-only',
    });

    await query.valueChanges.subscribe(({ data }) => {
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
    this.formGroup = new FormGroup({
      name: new FormControl(dataItem.name, Validators.required),
      email: new FormControl(dataItem.email, Validators.required),
      dob: new FormControl(dataItem.dob, Validators.required),
      id: new FormControl(dataItem.id, Validators.required),
    });

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
      const query = this.studentService.createStudent(
        this.formGroup.value.name,
        this.formGroup.value.email,
        this.formGroup.value.dob
      );

      query.subscribe(() => {
        this.fetchData();
      });

      sender.closeRow(rowIndex);
    } else {
      const query = this.studentService.updateStudent(
        this.formGroup.value.id,
        this.formGroup.value.name,
        this.formGroup.value.email,
        this.formGroup.value.dob
      );

      query.subscribe(() => {
        this.fetchData();
      });

      sender.closeRow(rowIndex);
    }
  }

  public cancelHandler({ sender, rowIndex }: { sender: any; rowIndex: any }) {
    sender.closeRow(rowIndex);
  }

  public addHandler({ sender }: { sender: any }) {
    this.formGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      dob: new FormControl('', Validators.required),
      id: new FormControl(0, Validators.required),
    });

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
    const query = this.studentService.deleteStudent(dataItem.id);

    query.subscribe(() => {
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
    event.preventDefault();
    const file = event.files[0].rawFile;

    const query = this.studentService.uploadFile(file);

    query.then(() => {
      this.fetchData();
    });

    (async () => {
      let channel = socket.subscribe('myChannel');
      for await (let data of channel) {
        if (data) {
          this.notificationService.show({
            content: `Uploaded entry, ${data}`,
            hideAfter: 2400,
            position: { horizontal: 'center', vertical: 'top' },
            animation: { type: 'fade', duration: 400 },
            type: { style: 'success', icon: true },
          });
        }
      }
    })();
  }
}
