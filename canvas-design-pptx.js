const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'canvas-design 技能详解';
pres.author = 'Claude';

// Color palette - Berry & Cream theme
const colors = {
    primary: "6D2E46",      // berry
    secondary: "A26769",     // dusty rose
    accent: "ECE2D0",        // cream
    dark: "3A2026",          // dark berry
    text: "363636",          // dark text
    light: "F5F2EB"          // light cream
};

// Helper for shadow (fresh object each time)
const makeShadow = () => ({
    type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.12
});

// ==================== SLIDE 1: Title ====================
let slide1 = pres.addSlide();
slide1.background = { color: colors.primary };

// Decorative circle
slide1.addShape(pres.shapes.OVAL, {
    x: 6.5, y: -1.5, w: 5, h: 5,
    fill: { color: colors.secondary, transparency: 30 }
});

slide1.addShape(pres.shapes.OVAL, {
    x: 7.5, y: 3.5, w: 3, h: 3,
    fill: { color: colors.accent, transparency: 50 }
});

slide1.addText("canvas-design", {
    x: 0.8, y: 1.8, w: 8, h: 1.2,
    fontSize: 48, fontFace: "Georgia", color: "FFFFFF", bold: true
});

slide1.addText("技能详解", {
    x: 0.8, y: 2.9, w: 8, h: 0.8,
    fontSize: 36, fontFace: "Georgia", color: colors.accent
});

slide1.addText("Create beautiful visual art using design philosophy", {
    x: 0.8, y: 4.2, w: 6, h: 0.5,
    fontSize: 14, fontFace: "Calibri", color: colors.accent, italic: true
});

// ==================== SLIDE 2: What is canvas-design ====================
let slide2 = pres.addSlide();
slide2.background = { color: colors.light };

slide2.addText("什么是 canvas-design", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Georgia", color: colors.primary, bold: true, margin: 0
});

// Left side - description
slide2.addText([
    { text: "一个创建设计哲学的艺术技能", options: { breakLine: true, bold: true, fontSize: 18 } },
    { text: "\n", options: { breakLine: true } },
    { text: "先创建设计哲学（美学宣言）", options: { breakLine: true } },
    { text: "再将其转化为视觉艺术作品", options: { breakLine: true } },
    { text: "\n", options: { breakLine: true } },
    { text: "输出格式：90% 视觉 + 10% 必要文字", options: { breakLine: true } },
    { text: "最终交付：.pdf 或 .png 文件", options: { breakLine: true } }
], {
    x: 0.5, y: 1.3, w: 4.5, h: 3,
    fontSize: 14, fontFace: "Calibri", color: colors.text, valign: "top"
});

// Right side - image card
slide2.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 1.3, w: 4, h: 3.5,
    fill: { color: "FFFFFF" },
    shadow: makeShadow()
});

slide2.addImage({
    path: "D:/Claude_Project/loneliness-poster.png",
    x: 5.7, y: 1.5, w: 3.6, h: 2.7
});

slide2.addText("孤独主题作品示例", {
    x: 5.7, y: 4.3, w: 3.6, h: 0.4,
    fontSize: 10, fontFace: "Calibri", color: colors.secondary, align: "center"
});

// ==================== SLIDE 3: Two-Stage Process ====================
let slide3 = pres.addSlide();
slide3.background = { color: colors.light };

slide3.addText("核心流程：两阶段创作", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Georgia", color: colors.primary, bold: true, margin: 0
});

// Stage 1 card
slide3.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.4, w: 4.2, h: 3.5,
    fill: { color: "FFFFFF" },
    shadow: makeShadow()
});

slide3.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.4, w: 4.2, h: 0.6,
    fill: { color: colors.primary }
});

slide3.addText("阶段一", {
    x: 0.5, y: 1.4, w: 4.2, h: 0.6,
    fontSize: 16, fontFace: "Calibri", color: "FFFFFF", bold: true, align: "center", valign: "middle"
});

slide3.addText("Design Philosophy Creation", {
    x: 0.7, y: 2.2, w: 3.8, h: 0.5,
    fontSize: 14, fontFace: "Georgia", color: colors.primary, bold: true
});

slide3.addText([
    { text: "• 创建设计哲学（.md）", options: { breakLine: true } },
    { text: "• 命名美学运动", options: { breakLine: true } },
    { text: "• 撰写4-6段哲学阐述", options: { breakLine: true } },
    { text: "• 定义视觉表达方向", options: { breakLine: true } }
], {
    x: 0.7, y: 2.8, w: 3.8, h: 2,
    fontSize: 12, fontFace: "Calibri", color: colors.text, valign: "top"
});

// Arrow
slide3.addText("→", {
    x: 4.7, y: 2.8, w: 0.6, h: 0.6,
    fontSize: 36, fontFace: "Arial", color: colors.secondary, align: "center", valign: "middle"
});

// Stage 2 card
slide3.addShape(pres.shapes.RECTANGLE, {
    x: 5.3, y: 1.4, w: 4.2, h: 3.5,
    fill: { color: "FFFFFF" },
    shadow: makeShadow()
});

slide3.addShape(pres.shapes.RECTANGLE, {
    x: 5.3, y: 1.4, w: 4.2, h: 0.6,
    fill: { color: colors.secondary }
});

slide3.addText("阶段二", {
    x: 5.3, y: 1.4, w: 4.2, h: 0.6,
    fontSize: 16, fontFace: "Calibri", color: "FFFFFF", bold: true, align: "center", valign: "middle"
});

slide3.addText("Canvas Creation", {
    x: 5.5, y: 2.2, w: 3.8, h: 0.5,
    fontSize: 14, fontFace: "Georgia", color: colors.primary, bold: true
});

slide3.addText([
    { text: "• 表达于画布之上", options: { breakLine: true } },
    { text: "• 生成 .pdf 或 .png", options: { breakLine: true } },
    { text: "• 90% 视觉 + 10% 文字", options: { breakLine: true } },
    { text: "• 专家级工艺打磨", options: { breakLine: true } }
], {
    x: 5.5, y: 2.8, w: 3.8, h: 2,
    fontSize: 12, fontFace: "Calibri", color: colors.text, valign: "top"
});

// ==================== SLIDE 4: Design Philosophy ====================
let slide4 = pres.addSlide();
slide4.background = { color: colors.light };

slide4.addText("设计哲学：如何生成", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Georgia", color: colors.primary, bold: true, margin: 0
});

// Steps
const steps = [
    { num: "1", title: "命名美学运动", desc: "1-2个词，如\"Brutalist Joy\"、\"Chromatic Silence\"" },
    { num: "2", title: "撰写哲学阐述", desc: "4-6段，说明空间、色彩、构图、尺度、视觉层级" },
    { num: "3", title: "强调工艺", desc: "反复强调\"专家级打磨\"、\"无数小时\"" },
    { num: "4", title: "留有创意空间", desc: "为下一个Claude提供 interpretive choices" }
];

steps.forEach((step, i) => {
    const y = 1.3 + i * 1.0;

    // Number circle
    slide4.addShape(pres.shapes.OVAL, {
        x: 0.5, y: y, w: 0.5, h: 0.5,
        fill: { color: colors.primary }
    });

    slide4.addText(step.num, {
        x: 0.5, y: y, w: 0.5, h: 0.5,
        fontSize: 14, fontFace: "Calibri", color: "FFFFFF", bold: true, align: "center", valign: "middle"
    });

    slide4.addText(step.title, {
        x: 1.2, y: y, w: 3, h: 0.5,
        fontSize: 14, fontFace: "Calibri", color: colors.primary, bold: true, valign: "middle", margin: 0
    });

    slide4.addText(step.desc, {
        x: 4.2, y: y, w: 5.3, h: 0.5,
        fontSize: 12, fontFace: "Calibri", color: colors.text, valign: "middle", margin: 0
    });
});

// ==================== SLIDE 5: Philosophy Examples ====================
let slide5 = pres.addSlide();
slide5.background = { color: colors.light };

slide5.addText("设计哲学示例", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Georgia", color: colors.primary, bold: true, margin: 0
});

const examples = [
    { name: "Concrete Poetry", desc: "通过纪念碑式形态和大胆几何进行交流" },
    { name: "Chromatic Language", desc: "色彩作为主要信息系统" },
    { name: "Analog Meditation", desc: "通过纹理和呼吸空间的安静视觉沉思" },
    { name: "Organic Systems", desc: "自然聚集和模块化生长模式" }
];

examples.forEach((ex, i) => {
    const y = 1.2 + i * 1.0;

    slide5.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: y, w: 9, h: 0.85,
        fill: { color: "FFFFFF" },
        shadow: makeShadow()
    });

    slide5.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: y, w: 0.08, h: 0.85,
        fill: { color: colors.primary }
    });

    slide5.addText(ex.name, {
        x: 0.8, y: y + 0.1, w: 3, h: 0.35,
        fontSize: 14, fontFace: "Georgia", color: colors.primary, bold: true, margin: 0
    });

    slide5.addText(ex.desc, {
        x: 0.8, y: y + 0.45, w: 8, h: 0.35,
        fontSize: 11, fontFace: "Calibri", color: colors.text, margin: 0
    });
});

// ==================== SLIDE 6: Canvas Creation Principles ====================
let slide6 = pres.addSlide();
slide6.background = { color: colors.primary };

slide6.addText("画布创建原则", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Georgia", color: "FFFFFF", bold: true, margin: 0
});

const principles = [
    "90% 视觉元素 + 10% 必要文字",
    "文字要稀疏、精准、融入视觉",
    "颜色受限但有凝聚力",
    "元素不重叠、不超出边界",
    "像博物馆级作品一样打磨"
];

principles.forEach((p, i) => {
    const y = 1.2 + i * 0.8;

    slide6.addShape(pres.shapes.OVAL, {
        x: 0.5, y: y + 0.1, w: 0.3, h: 0.3,
        fill: { color: colors.accent }
    });

    slide6.addText(p, {
        x: 1.0, y: y, w: 8.5, h: 0.5,
        fontSize: 16, fontFace: "Calibri", color: "FFFFFF", valign: "middle", margin: 0
    });
});

// ==================== SLIDE 7: Use Cases ====================
let slide7 = pres.addSlide();
slide7.background = { color: colors.light };

slide7.addText("适用场景", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Georgia", color: colors.primary, bold: true, margin: 0
});

const cases = [
    { title: "海报", desc: "音乐节、展览、演出海报" },
    { title: "艺术作品", desc: "抽象艺术、概念艺术" },
    { title: "书籍封面", desc: "咖啡桌书籍" },
    { title: "品牌物料", desc: "品牌手册、艺术装置" }
];

cases.forEach((c, i) => {
    const x = 0.5 + (i % 2) * 4.7;
    const y = 1.2 + Math.floor(i / 2) * 2.0;

    slide7.addShape(pres.shapes.RECTANGLE, {
        x: x, y: y, w: 4.3, h: 1.7,
        fill: { color: "FFFFFF" },
        shadow: makeShadow()
    });

    slide7.addText(c.title, {
        x: x + 0.3, y: y + 0.3, w: 3.7, h: 0.5,
        fontSize: 18, fontFace: "Georgia", color: colors.primary, bold: true, margin: 0
    });

    slide7.addText(c.desc, {
        x: x + 0.3, y: y + 0.9, w: 3.7, h: 0.5,
        fontSize: 12, fontFace: "Calibri", color: colors.text, margin: 0
    });
});

// ==================== SLIDE 8: Work Examples ====================
let slide8 = pres.addSlide();
slide8.background = { color: colors.light };

slide8.addText("作品案例展示", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Georgia", color: colors.primary, bold: true, margin: 0
});

// 6.1 poster
slide8.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.2, w: 4.3, h: 3.8,
    fill: { color: "FFFFFF" },
    shadow: makeShadow()
});

slide8.addImage({
    path: "D:/Claude_Project/61-poster.png",
    x: 0.7, y: 1.4, w: 3.9, h: 2.9
});

slide8.addText("6.1 国际儿童节", {
    x: 0.7, y: 4.4, w: 3.9, h: 0.4,
    fontSize: 12, fontFace: "Calibri", color: colors.secondary, align: "center"
});

// Loneliness poster
slide8.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.2, w: 4.3, h: 3.8,
    fill: { color: "FFFFFF" },
    shadow: makeShadow()
});

slide8.addImage({
    path: "D:/Claude_Project/loneliness-poster.png",
    x: 5.4, y: 1.4, w: 3.9, h: 2.9
});

slide8.addText("孤独", {
    x: 5.4, y: 4.4, w: 3.9, h: 0.4,
    fontSize: 12, fontFace: "Calibri", color: colors.secondary, align: "center"
});

// ==================== SLIDE 9: Summary ====================
let slide9 = pres.addSlide();
slide9.background = { color: colors.dark };

slide9.addShape(pres.shapes.OVAL, {
    x: -2, y: -2, w: 6, h: 6,
    fill: { color: colors.secondary, transparency: 40 }
});

slide9.addShape(pres.shapes.OVAL, {
    x: 7, y: 3, w: 4, h: 4,
    fill: { color: colors.primary, transparency: 30 }
});

slide9.addText("核心要点", {
    x: 0.8, y: 1.5, w: 8, h: 0.8,
    fontSize: 36, fontFace: "Georgia", color: "FFFFFF", bold: true
});

slide9.addText([
    { text: "设计哲学 → 视觉艺术", options: { breakLine: true } },
    { text: "90% 视觉 + 10% 文字", options: { breakLine: true } },
    { text: "专家级工艺打磨", options: { breakLine: true } },
    { text: "输出 .pdf 或 .png", options: { breakLine: true } }
], {
    x: 0.8, y: 2.5, w: 8, h: 2.5,
    fontSize: 20, fontFace: "Calibri", color: colors.accent, valign: "top"
});

// Save
pres.writeFile({ fileName: "D:/Claude_Project/canvas-design-intro.pptx" })
    .then(() => console.log("PPTX created: canvas-design-intro.pptx"))
    .catch(err => console.error(err));