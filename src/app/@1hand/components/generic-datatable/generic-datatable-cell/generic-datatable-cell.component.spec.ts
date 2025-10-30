import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDatatableCellComponent } from './generic-datatable-cell.component';

describe('GenericDatatableCellComponent', () => {
  let component: GenericDatatableCellComponent;
  let fixture: ComponentFixture<GenericDatatableCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericDatatableCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericDatatableCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
