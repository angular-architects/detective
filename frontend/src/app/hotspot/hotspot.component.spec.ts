import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotspotComponent } from './hotspot.component';

describe('HotspotComponent', () => {
  let component: HotspotComponent;
  let fixture: ComponentFixture<HotspotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotspotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotspotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
