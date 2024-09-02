import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamAlignmentComponent } from './team-alignment.component';

describe('TeamAlignmentComponent', () => {
  let component: TeamAlignmentComponent;
  let fixture: ComponentFixture<TeamAlignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamAlignmentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamAlignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
