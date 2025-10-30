import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFileManagerModalComponent } from './generic-file-manager-modal.component';

describe('GenericFileManagerModalComponent', () => {
  let component: GenericFileManagerModalComponent;
  let fixture: ComponentFixture<GenericFileManagerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFileManagerModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFileManagerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
