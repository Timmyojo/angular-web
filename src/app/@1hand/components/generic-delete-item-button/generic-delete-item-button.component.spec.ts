import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDeleteItemButtonComponent } from './generic-delete-item-button.component';

describe('GenericDeleteItemButtonComponent', () => {
  let component: GenericDeleteItemButtonComponent;
  let fixture: ComponentFixture<GenericDeleteItemButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericDeleteItemButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericDeleteItemButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
