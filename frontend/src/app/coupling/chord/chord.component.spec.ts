import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouplingComponent } from './coupling.component';

describe('CouplingComponent', () => {
  let component: CouplingComponent;
  let fixture: ComponentFixture<CouplingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouplingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouplingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
