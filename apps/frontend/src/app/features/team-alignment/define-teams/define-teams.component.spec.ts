import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineTeamsComponent } from './define-teams.component';

describe('DefineTeamsComponent', () => {
  let component: DefineTeamsComponent;
  let fixture: ComponentFixture<DefineTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefineTeamsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DefineTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
