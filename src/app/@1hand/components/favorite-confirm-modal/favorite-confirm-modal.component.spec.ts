import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteConfirmModalComponent } from './favorite-confirm-modal.component';

describe('FavoriteConfirmModalComponent', () => {
  let component: FavoriteConfirmModalComponent;
  let fixture: ComponentFixture<FavoriteConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteConfirmModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
