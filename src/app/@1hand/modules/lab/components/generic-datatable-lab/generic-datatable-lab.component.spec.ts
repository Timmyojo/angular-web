import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDatatableLabComponent } from './generic-datatable-lab.component';

describe('GenericDatatableLabComponent', () => {
  let component: GenericDatatableLabComponent;
  let fixture: ComponentFixture<GenericDatatableLabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericDatatableLabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericDatatableLabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
