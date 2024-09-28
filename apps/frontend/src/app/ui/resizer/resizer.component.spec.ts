import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizerComponent } from './resizer.component';

describe('ResizerComponent', () => {
  let component: ResizerComponent;
  let fixture: ComponentFixture<ResizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResizerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
