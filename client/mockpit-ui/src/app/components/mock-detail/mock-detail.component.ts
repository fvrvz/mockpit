import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { Mock, MockResponse } from 'src/app/models/mock/mock.model';
import { MockService } from 'src/app/services/mock.service';

@Component({
  selector: 'app-mock-detail',
  templateUrl: './mock-detail.component.html',
  styleUrls: ['./mock-detail.component.scss'],
  host: {
    class: "container"
  }
})
export class MockDetailComponent implements OnInit {
  mock: Mock | undefined;

  mockForm!: FormGroup;

  errorMessage?: string;

  constructor(private route: ActivatedRoute, private router: Router, private mockService: MockService, private toast: ToastrService) {
    this.initialize();
  }

  ngOnInit(): void {
    this.mock = undefined;
    this.initialize();
  }

  initialize() {
    let mockId = this.route.snapshot.paramMap.get('id');
    if(mockId){
      this.mockService.getMockById(mockId).subscribe(
        (response) => { 
          this.mock = response.data;
          this.initializeForm(this.mock);
        },
        (error)=>{
          this.errorMessage = error?.error?.message;
        }
      );
    }
  }

  initializeForm(mock:Mock | undefined){
    this.mockForm = new FormGroup({
      'id': new FormControl(mock?.id),
      'name': new FormControl(mock?.name, Validators.required),
      'description': new FormControl(mock?.description),
      'route': new FormGroup({
        'path': new FormControl(mock?.route.path),
        'method': new FormControl(mock?.route.method)
      }),
      'responseHeaders': new FormArray(new Array()),
      'responseBody': new FormGroup({
        'type': new FormControl(mock?.responseBody.type),
        'content': new FormControl(JSON.stringify( mock?.responseBody.content)),
        'contentType': new FormControl(mock?.responseBody.contentType)
      }),
      'responseStatus': new FormGroup({
        'code': new FormControl(mock?.responseStatus.code)
      }),
      'active': new FormControl(mock?.active)
    });
  }

  onSubmit() {
    this.mockService.saveMock(this.mockForm.value).subscribe(
      (response: MockResponse) => {
        this.mock = response.data;
        this.toast.success("Mock saved", "Success");
      },
      (error)=>{
        this.toast.error(error.error.message, "Error");
      });
  }

  onCancel(){
    this.initializeForm(this.mock);
  }

  onDelete(){
    this.mockService.deleteMockById(this.mock?.id).subscribe(
      (data)=> {
        this.toast.success("Mock deleted.", "Success");
        this.router.navigate(['/manage']);
      },
      (error)=>console.error(error)
    );
  }

  onTest(){
    this.router.navigateByUrl(this.mockService.backendUrl + this.mock?.route.path);
  }
}
