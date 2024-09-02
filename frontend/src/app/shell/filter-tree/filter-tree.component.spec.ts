import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterTreeComponent } from './filter-tree.component';

describe('FilterTreeComponent', () => {
  let component: FilterTreeComponent;
  let fixture: ComponentFixture<FilterTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterTreeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
