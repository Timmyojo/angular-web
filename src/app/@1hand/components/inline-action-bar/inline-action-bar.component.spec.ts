import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineActionBarComponent } from './inline-action-bar.component';

describe('InlineActionBarComponent', () => {
  let component: InlineActionBarComponent;
  let fixture: ComponentFixture<InlineActionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineActionBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlineActionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
