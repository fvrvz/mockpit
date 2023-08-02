import { DomSanitizer } from '@angular/platform-browser';
import { Renderer2 } from '@angular/core'
import { AfterViewInit, ViewChild, Component, OnDestroy, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, map, switchMap, takeUntil } from 'rxjs';

import { Mock, MockResponse } from 'src/app/models/mock/mock.model';
import { MockService } from 'src/app/services/mock.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-mock-list',
  templateUrl: './mock-list.component.html',
  styleUrls: ['./mock-list.component.scss'],
  host: {
    class: "container"
  }
})
export class MockListComponent implements OnInit, OnDestroy, AfterViewInit {
  mocks$: Subject<Mock[]> = new Subject<Mock[]>();
  mocksList$!: Observable<Mock[]>;
  isLoading: boolean = false;
  searchResults$?: Observable<Mock[]>;

  displayedColumns: string[] = ['name', 'description', 'method', 'path', 'action'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  length = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent!: PageEvent;

  @ViewChild('fileInput') fileInput: any;
  selectedFile: Blob = new Blob();

  private unsubscribeAll$ = new Subject<any>();

  ngAfterViewInit() {
  }

  constructor(private mockService: MockService, private toast: ToastrService, private sanitizer: DomSanitizer, private renderer: Renderer2) {

  }

  ngOnInit(): void {
    this.getMocks(this.pageIndex, this.pageSize);
    this.mocks$.subscribe(mocks=> {
      this.dataSource = new MatTableDataSource<Mock>(mocks)
      
    });
  }

  handlePageEvent(e: PageEvent) {
    
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.getMocks(this.pageIndex, this.pageSize);
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }


  getMocks(pageNo?: number, pageSize?: number) {
    this.isLoading = true;
    this.mockService.getMocks(pageNo, pageSize).subscribe(
      (mockResponse: MockResponse) => {
        this.mocks$.next(mockResponse.data.content);
        this.length = mockResponse.data.totalElements;
        this.isLoading = false;
      }
    );
  }

  deleteMock(id: number) {
    this.mockService.deleteMockById(id).subscribe(
      (response) => {
        this.toast.success("Mock deleted.", "Success");
        this.getMocks()
      },
      (error) => { }
    );
  }

  onExport() {
    this.mockService.exportAllMocks().subscribe(
      (response: HttpResponse<any>) => {
        const file = new Blob([response.body], { type: 'application/octet-stream' });

        const fileUrl = URL.createObjectURL(file);
        const contentDisposition: string | undefined | null = response.headers.get('Content-Disposition');

        let fileName: string | undefined = '';
        if (contentDisposition && contentDisposition?.indexOf('"') > -1) {
          fileName = contentDisposition?.substring(contentDisposition.indexOf('filename') + 10, contentDisposition.length - 1);
        } else {
          fileName = contentDisposition?.substring(contentDisposition.indexOf('filename') + 9, contentDisposition.length - 1);
        }
        const link = this.renderer.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', fileUrl);
        link.setAttribute('download', fileName);
        link.click();
        link.remove();
        this.toast.success("Mocks exported", "Success");
      }
    );
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.uploadFile();
    }
  }

  uploadFile() {
    const formData = new FormData();
    if (this.selectedFile)
      formData.append('file', this.selectedFile);

    this.mockService.importMocks(formData).subscribe(
      (response: MockResponse) => {
        this.getMocks();
        this.toast.success(response.message, 'Success');
      },
      (error) => {
        console.error(error);
        this.toast.error(error.error.message, 'Error');
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.unsubscribe();
  }
}