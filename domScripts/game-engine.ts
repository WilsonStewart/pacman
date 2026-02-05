/// <reference lib="dom" />

export type IPoses = {
  default: string;
  poses: Record<string, TPose>;
};

export type TPose = {
  type: "static" | "animated";
  durationMs?: number;
  frames: {
    href: string;
    frame: number;
    mirror?: "mirrorH" | "mirrorV";
  }[];
} & (
  | { type: "static"; durationMs?: never }
  | { type: "animated"; durationMs: number }
);

class Entity {
  mountingElement: HTMLElement;
  mainSvg: SVGSVGElement;
  poses: IPoses;
  currentPoseKey: string;
  currentPoseFrameNumber: number = 0;
  currentPoseAnimationInterval: NodeJS.Timeout | undefined;
  size; // entities are square, this is the side length in pixels
  baseColor: string;

  constructor(opts: {
    mountingElement: HTMLElement;
    poses: IPoses;
    size: number;
    baseColor: string;
  }) {
    this.mountingElement = opts.mountingElement;
    this.poses = opts.poses;
    this.size = opts.size ?? 32;
    this.baseColor = opts.baseColor ?? "white";

    // Initalize the svg ontop of the mountingElement
    this.mainSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    this.mainSvg.setAttribute("shape-rendering", "crispEdges");
    this.mainSvg.setAttribute("image-rendering", "pixelated");
    this.mainSvg.setAttribute("width", this.size.toString());
    this.mainSvg.setAttribute("height", this.size.toString());
    this.mainSvg.setAttribute("id", this.mountingElement.id);
    this.mountingElement.replaceWith(this.mainSvg);

    // Set pose defaults
    this.currentPoseKey =
      sessionStorage.getItem(`${this.mainSvg.id}:poseKey`) ??
      this.poses.default;
    this.setPose(this.currentPoseKey);
  }

  setPose(poseKey: string) {
    sessionStorage.setItem(`${this.mainSvg.id}:poseKey`, poseKey);

    this.currentPoseKey = poseKey;
    this.currentPoseFrameNumber = 0;
    const currentPose = this.poses.poses[poseKey]!;

    if (this.currentPoseAnimationInterval)
      clearInterval(this.currentPoseAnimationInterval);

    let useElements: SVGUseElement[] = [];
    currentPose.frames.forEach((p) => {
      let ue = document.createElementNS("http://www.w3.org/2000/svg", "use");
      ue.setAttribute("href", p.href);
      ue.style.color = this.baseColor;

      ue.setAttribute("data-frame", p.frame.toString());
      if (p.frame > 0) ue.style.opacity = "0";

      useElements.push(ue);
    });

    this.mainSvg.setAttribute("data-pose-type", currentPose.type);
    this.mainSvg.setAttribute("data-pose-name", this.currentPoseKey);

    if (currentPose.type === "animated") {
      this.currentPoseAnimationInterval = setInterval(() => {
        (
          this.mainSvg.querySelector(
            `use[data-frame="${this.currentPoseFrameNumber.toString()}"]`,
          ) as SVGUseElement
        ).style.opacity = "0";

        this.currentPoseFrameNumber + 1 === currentPose.frames.length
          ? (this.currentPoseFrameNumber = 0)
          : this.currentPoseFrameNumber++;

        (
          this.mainSvg.querySelector(
            `use[data-frame="${this.currentPoseFrameNumber.toString()}"]`,
          ) as SVGUseElement
        ).style.opacity = "1";
      }, currentPose.durationMs);
    }

    this.mainSvg.replaceChildren(...useElements);
  }
}

export class Pacman extends Entity {
  constructor(opts: {
    size: number;
    baseColor?: string;
    mountingElement: HTMLElement;
  }) {
    super({
      size: opts.size,
      baseColor: opts.baseColor ?? "#ffff07",
      mountingElement: opts.mountingElement,
      poses: {
        default: "rightIdle",
        poses: {
          rightIdle: {
            type: "static",
            frames: [
              {
                href: "/spritesheet.svg#pacman-right",
                frame: 0,
              },
            ],
          },
          rightChomp: {
            type: "animated",
            durationMs: 130,
            frames: [
              {
                href: "/spritesheet.svg#pacman-chomp-right",
                frame: 0,
              },
              {
                href: "/spritesheet.svg#pacman-right",
                frame: 1,
              },
            ],
          },
        },
      },
    });
  }
}
