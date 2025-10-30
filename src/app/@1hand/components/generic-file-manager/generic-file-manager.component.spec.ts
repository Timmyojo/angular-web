import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFileManagerComponent } from './generic-file-manager.component';

describe('GenericFileManagerComponent', () => {
  let component: GenericFileManagerComponent;
  let fixture: ComponentFixture<GenericFileManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFileManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFileManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
