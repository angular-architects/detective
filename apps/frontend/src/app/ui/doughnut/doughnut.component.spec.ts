import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoughnutComponent } from './doughnut.component';

describe('DoughnutComponent', () => {
  let component: DoughnutComponent;
  let fixture: ComponentFixture<DoughnutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoughnutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DoughnutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
