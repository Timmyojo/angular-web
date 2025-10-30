import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDatatableActionsCellComponent } from '../generic-datatable-action-cell/generic-datatable-action-cell.component';

describe('GenericDatatableActionsCellComponent', () => {
  let component: GenericDatatableActionsCellComponent;
  let fixture: ComponentFixture<GenericDatatableActionsCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericDatatableActionsCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericDatatableActionsCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
