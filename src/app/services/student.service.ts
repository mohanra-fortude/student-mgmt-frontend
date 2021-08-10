import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';
import { Student } from 'src/app/Student';
import { request } from 'graphql-request';


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

const UPLOADFILE = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private apollo: Apollo) {}

  

  createStudent(name: string, email: string, dob: string) {
    return this.apollo.mutate({
      mutation: CREATE_STUDENT,
      variables: {
        name: name,
        email: email,
        dob: dob,
      },
    });
  }

    updateStudent(id:number, name:string, email:string, dob:string) {
    return this.apollo.mutate({
      mutation: UPDATE_STUDENT,
      variables: {
        id:id,
        name: name,
        email: email,
        dob: dob,
      },
    });
    }
  
  deleteStudent(id:number) {
    return this.apollo.mutate({
      mutation: DELETE,
      variables: {
        studentId:id,
      },
    });
  }

  uploadFile(file:any) {
  return request('http://localhost:3003/graphql', UPLOADFILE, {
      file: file,
    })
}
}
