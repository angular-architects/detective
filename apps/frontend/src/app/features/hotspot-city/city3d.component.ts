import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  viewChild,
  EventEmitter,
} from '@angular/core';
import * as THREE from 'three';

import { City3DBoundaries, City3DItem, City3DMeta } from './city3d.types';

@Component({
  selector: 'app-city3d',
  standalone: true,
  imports: [CommonModule],
  template: ` <div class="canvas" #canvasContainer></div> `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        flex: 1 1 auto;
        min-height: 240px;
        width: 100%;
      }
    `,
    `
      .canvas {
        position: relative;
        height: 100%;
        width: 100%;
        min-height: 240px;
        z-index: 0;
      }
    `,
    `
      .canvas canvas {
        position: absolute;
        inset: 0;
        z-index: 0;
      }
    `,
  ],
})
export class City3DComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) items: City3DItem[] = [];
  @Input({ required: true }) mode: 'file' | 'module' = 'file';
  @Input() boundaries?: City3DBoundaries;

  @Output() hoverChange = new EventEmitter<{
    meta: City3DMeta | null;
    x: number;
    y: number;
  }>();
  @Output() buildingClick = new EventEmitter<City3DMeta>();

  canvasContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('canvasContainer');

  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private raycaster?: THREE.Raycaster;
  private mouse?: THREE.Vector2;
  private animationHandle = 0;
  private cleanup?: () => void;

  private buildings: THREE.Mesh[] = [];
  private hoveredObject: THREE.Mesh | null = null;
  private skipNextClick = false;
  private platform?: THREE.Mesh;

  // simple camera controls state
  private isLeftMouseDown = false;
  private isRightMouseDown = false;
  private isSpacePan = false;
  private mouseX = 0;
  private mouseY = 0;
  private targetRotationX = Math.PI / 4;
  private targetRotationY = 0;
  private targetPanX = 0;
  private targetPanZ = 0;
  private distance = 100;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['mode']) {
      if (!this.scene) {
        this.setupScene();
        this.startAnimation();
      }
      const modeChanged =
        !!changes['mode'] &&
        changes['mode'].previousValue !== changes['mode'].currentValue;
      this.buildCity(modeChanged || !changes['items']);
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationHandle);
    this.teardownScene();
  }

  private setupScene(): void {
    this.teardownScene();

    const container = this.canvasContainer().nativeElement;
    const width = container.clientWidth || 600;
    const height = Math.max(200, container.clientHeight || 400);

    const scene = new THREE.Scene();
    scene.fog = null;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    const initialDistance = 180;
    const angle = Math.PI / 4; // 45°
    camera.position.set(
      Math.sin(angle) * Math.cos(angle) * initialDistance,
      Math.sin(angle) * initialDistance,
      Math.cos(angle) * Math.cos(angle) * initialDistance
    );
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    scene.add(directionalLight);
    const pointLight1 = new THREE.PointLight(0x4fc3f7, 0.5, 100);
    pointLight1.position.set(20, 30, 20);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0xff6b6b, 0.5, 100);
    pointLight2.position.set(-20, 30, -20);
    scene.add(pointLight2);

    // raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // resize observer
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || 600;
      const h = Math.max(200, container.clientHeight || 400);
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.cleanup = () => {
      resizeObserver.disconnect();
    };
  }

  private startAnimation(): void {
    const animate = () => {
      const renderer = this.renderer;
      const scene = this.scene;
      const camera = this.camera;
      if (!renderer || !scene || !camera) {
        this.animationHandle = requestAnimationFrame(animate);
        return;
      }
      this.updateCamera(camera);
      renderer.render(scene, camera);
      this.animationHandle = requestAnimationFrame(animate);
    };
    this.animationHandle = requestAnimationFrame(animate);
  }

  private updateCamera(camera: THREE.PerspectiveCamera): void {
    camera.position.x =
      Math.sin(this.targetRotationY) *
        Math.cos(this.targetRotationX) *
        this.distance +
      this.targetPanX;
    camera.position.y = Math.sin(this.targetRotationX) * this.distance;
    camera.position.z =
      Math.cos(this.targetRotationY) *
        Math.cos(this.targetRotationX) *
        this.distance +
      this.targetPanZ;
    camera.lookAt(this.targetPanX, 0, this.targetPanZ);
  }

  private buildCity(fitCamera: boolean): void {
    const scene = this.scene;
    if (!scene) return;

    // remove old buildings
    this.buildings.forEach((b) => scene.remove(b));
    this.buildings = [];

    if (this.platform) {
      scene.remove(this.platform);
      const geom = this.platform.geometry as THREE.BufferGeometry | undefined;
      const mat = this.platform.material as THREE.Material | THREE.Material[];
      if (geom) geom.dispose();
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
      this.platform = undefined;
    }

    const total = this.items.length;
    const gridSize = Math.ceil(Math.sqrt(total));
    const maxSide = this.items.length
      ? Math.max(
          ...this.items.map((i) => this.computeFootprintFromLoc(i.footprint))
        )
      : 1;
    const cellSize = Math.max(4, Math.ceil(maxSide + 2));

    const bbox = new THREE.Box3();
    this.items.forEach((item, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      const height = Math.max(1, this.normalizeComplexity(item.height));
      const side = this.computeFootprintFromLoc(item.footprint);
      const width = side;
      const depth = side;

      const buildingGeometry = new THREE.BoxGeometry(width, height, depth);

      const color = this.resolveColor(item);
      const emissiveIntensity =
        color === 0xffc107 || color === 0xf44336 ? 0.3 : 0.1;
      const buildingMaterial = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity,
      });

      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(
        (col - gridSize / 2) * cellSize,
        height / 2 + 0.25,
        (row - gridSize / 2) * cellSize
      );
      building.castShadow = false;
      building.receiveShadow = false;
      building.userData = item.meta;

      this.buildings.push(building);
      scene.add(building);
      bbox.expandByObject(building);
    });

    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());

    const margin = Math.max(4, cellSize);
    const cols = Math.min(total, gridSize);
    const rows = Math.ceil(total / gridSize);
    const platformWidth = Math.max(8, cols * cellSize + margin);
    const platformDepth = Math.max(8, rows * cellSize + margin);
    const platformGeometry = new THREE.BoxGeometry(
      platformWidth,
      0.5,
      platformDepth
    );
    const platformMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      emissiveIntensity: 0.0,
      shininess: 10,
      specular: 0xdddddd,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(center.x, 0, center.z);
    platform.receiveShadow = false;
    scene.add(platform);
    this.platform = platform;

    if (fitCamera) {
      const maxDim = Math.max(size.x, size.y, size.z);
      const camera = this.camera;
      if (camera) {
        const fov = (camera.fov * Math.PI) / 180;
        const fitHeightDistance = maxDim / 2 / Math.tan(fov / 2);
        const fitWidthDistance = fitHeightDistance / camera.aspect;
        const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.15;
        this.distance = Math.max(20, Math.min(4000, distance));

        this.targetPanX = center.x;
        this.targetPanZ = center.z;
      }
    }
  }

  private resolveColor(item: City3DItem): number {
    if (this.mode === 'file') {
      const mcCabe = item.height;
      if (mcCabe < 10) return 0x4caf50;
      if (mcCabe < 20) return 0xffc107;
      if (mcCabe < 40) return 0xff9800;
      return 0xf44336;
    } else {
      const b = this.boundaries;
      if (!b) return 0x4caf50;
      const meta = item.meta;
      if (meta.kind !== 'module') return 0x4caf50;
      const moduleScore =
        meta.countHotspot > 0
          ? b.hotspotBoundary
          : meta.countWarning > 0
          ? b.warningBoundary
          : 0;
      if (moduleScore >= b.hotspotBoundary) return 0xf44336;
      if (moduleScore >= b.warningBoundary) return 0xffc107;
      return 0x4caf50;
    }
  }

  private normalizeComplexity(value: number): number {
    const height = (value / 100) * 20;
    return Math.min(20, Math.max(1, height));
  }

  private computeFootprintFromLoc(loc: number): number {
    const side = Math.sqrt(Math.max(1, loc));
    const scaled = Math.min(6, 0.5 + side / 6);
    return scaled;
  }

  private teardownScene(): void {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = undefined;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.raycaster = undefined;
    this.mouse = undefined;
    this.buildings = [];
    this.hoveredObject = null;
  }

  // interaction
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!this.renderer || !target || !this.renderer.domElement.contains(target))
      return;
    if (event.button === 0) this.isLeftMouseDown = true;
    if (event.button === 2) this.isRightMouseDown = true;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!this.renderer || !target || !this.renderer.domElement.contains(target))
      return;
    if (event.button === 0) this.isLeftMouseDown = false;
    if (event.button === 2) this.isRightMouseDown = false;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const renderer = this.renderer;
    const camera = this.camera;
    if (!renderer || !camera) return;
    const targetNode = event.target as Node | null;
    const isOverCanvas =
      !!targetNode && renderer.domElement.contains(targetNode);

    if (this.isLeftMouseDown && !this.isSpacePan) {
      this.targetRotationY += (event.clientX - this.mouseX) * 0.005;
      this.targetRotationX += (event.clientY - this.mouseY) * 0.005;
    }
    if (this.isRightMouseDown || (this.isLeftMouseDown && this.isSpacePan)) {
      const dx = event.clientX - this.mouseX;
      const dy = event.clientY - this.mouseY;
      this.targetPanX -= dx * 0.2;
      this.targetPanZ -= dy * 0.2;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.skipNextClick = true;
    }
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    if (!isOverCanvas || !this.mouse || !this.raycaster) return;

    const rect = renderer.domElement.getBoundingClientRect();
    const normX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.mouse.set(normX, normY);
    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(this.buildings);

    if (intersects.length > 0) {
      const object = intersects[0].object as THREE.Mesh;
      if (this.hoveredObject !== object) {
        if (this.hoveredObject) this.hoveredObject.scale.set(1, 1, 1);
        this.hoveredObject = object;
        object.scale.set(1.1, 1.1, 1.1);
      }
      const meta = object.userData as City3DMeta;
      const left = event.clientX - rect.left + 12;
      const top = event.clientY - rect.top + 12;
      this.hoverChange.emit({ meta, x: left, y: top });
    } else {
      if (this.hoveredObject) {
        this.hoveredObject.scale.set(1, 1, 1);
        this.hoveredObject = null;
      }
      this.hoverChange.emit({ meta: null, x: 0, y: 0 });
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    const target = event.target as Node | null;
    if (!this.renderer || !target || !this.renderer.domElement.contains(target))
      return;
    this.distance += event.deltaY * 0.05;
    this.distance = Math.max(20, Math.min(4000, this.distance));
    event.preventDefault();
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!this.renderer || !target || !this.renderer.domElement.contains(target))
      return;
    event.preventDefault();
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!this.renderer || !target || !this.renderer.domElement.contains(target))
      return;
    if (this.skipNextClick) {
      this.skipNextClick = false;
      return;
    }
    if (!this.hoveredObject) return;
    const meta = this.hoveredObject.userData as City3DMeta;
    this.buildingClick.emit(meta);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      this.isSpacePan = true;
      event.preventDefault();
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      this.isSpacePan = false;
      event.preventDefault();
    }
  }
}
