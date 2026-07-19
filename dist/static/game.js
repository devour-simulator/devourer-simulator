// ============ 游戏配置和常量 ============
const GAME_WIDTH = 1000;
document.title = '吞噬模拟器';
const GAME_HEIGHT = 700;
const TILE_SIZE = 50;
const TARGET_FPS = 60;
const MAX_FRAME_DELTA = 0.1; // 避免切回标签页时一次性跳过太多游戏时间

// ============ 角色定义 ============
const ANIMALS = {
    cat: {
        name: '小猫',
        emoji: '🐱',
        baseAttack: 5,
        baseDefense: 2,
        baseSpeed: 6,
        baseHp: 30,
        color: '#FFB6C1',
        unlocked: true
    },
    rabbit: {
        name: '小兔',
        emoji: '🐰',
        baseAttack: 3,
        baseDefense: 1,
        baseSpeed: 8,
        baseHp: 25,
        color: '#FFE4E1',
        unlocked: true
    },
    fox: {
        name: '小狐狸',
        emoji: '🦊',
        baseAttack: 7,
        baseDefense: 3,
        baseSpeed: 7,
        baseHp: 35,
        color: '#FFA500',
        unlocked: false,
        unlockThreshold: 10
    },
    bear: {
        name: '黑熊',
        emoji: '🐻‍❄️',
        baseAttack: 8,
        baseDefense: 6,
        baseSpeed: 3,
        baseHp: 50,
        color: '#8B7355',
        unlocked: false,
        unlockThreshold: 10
    },
    tiger: {
        name: '老虎',
        emoji: '🐯',
        baseAttack: 10,
        baseDefense: 5,
        baseSpeed: 4,
        baseHp: 45,
        color: '#FF8C00',
        unlocked: false,
        unlockThreshold: 10
    },
    eagle: {
        name: '苍鹰',
        emoji: '🦅',
        baseAttack: 6,
        baseDefense: 2,
        baseSpeed: 9,
        baseHp: 28,
        color: '#DAA520',
        unlocked: false,
        unlockThreshold: 10
    },
    leopard: {
        name: '金钱豹',
        emoji: '🐆',
        baseAttack: 9,
        baseDefense: 4,
        baseSpeed: 8,
        baseHp: 40,
        color: '#FFD700',
        unlocked: false,
        unlockThreshold: 20
    },
    phoenix: {
        name: '火凤凰',
        emoji: '🐦‍🔥',
        baseAttack: 12,
        baseDefense: 7,
        baseSpeed: 5,
        baseHp: 55,
        color: '#FF4500',
        unlocked: false,
        unlockThreshold: 25
    },
    wolf: { name: '雪狼', emoji: '🐺', baseAttack: 8, baseDefense: 3, baseSpeed: 7, baseHp: 38, color: '#B0C4DE', unlocked: false, unlockThreshold: 30 },
    deer: { name: '灵鹿', emoji: '🦌', baseAttack: 4, baseDefense: 3, baseSpeed: 10, baseHp: 34, color: '#DEB887', unlocked: false, unlockThreshold: 35 },
    panda: { name: '熊猫', emoji: '🐼', baseAttack: 6, baseDefense: 7, baseSpeed: 3, baseHp: 58, color: '#2F4F4F', unlocked: false, unlockThreshold: 40 },
    monkey: { name: '灵猴', emoji: '🐵', baseAttack: 7, baseDefense: 2, baseSpeed: 9, baseHp: 32, color: '#CD853F', unlocked: false, unlockThreshold: 45 },
    otter: { name: '水獭', emoji: '🦦', baseAttack: 5, baseDefense: 4, baseSpeed: 8, baseHp: 40, color: '#8FBC8F', unlocked: false, unlockThreshold: 50 },
    owl: { name: '夜枭', emoji: '🦉', baseAttack: 7, baseDefense: 3, baseSpeed: 8, baseHp: 36, color: '#6A5ACD', unlocked: false, unlockThreshold: 55 },
    boar: { name: '野猪', emoji: '🐗', baseAttack: 9, baseDefense: 5, baseSpeed: 5, baseHp: 52, color: '#A0522D', unlocked: false, unlockThreshold: 60 },
    elephant: { name: '小象', emoji: '🐘', baseAttack: 8, baseDefense: 8, baseSpeed: 2, baseHp: 65, color: '#778899', unlocked: false, unlockThreshold: 70 },
    hedgehog: { name: '刺猬', emoji: '🦔', baseAttack: 6, baseDefense: 6, baseSpeed: 5, baseHp: 44, color: '#8B4513', unlocked: false, unlockThreshold: 80 },
    crane: { name: '仙鹤', emoji: '🦢', baseAttack: 5, baseDefense: 3, baseSpeed: 10, baseHp: 35, color: '#E6E6FA', unlocked: false, unlockThreshold: 90 },
    giraffe: { name: '长颈鹿', emoji: '🦒', baseAttack: 7, baseDefense: 4, baseSpeed: 6, baseHp: 48, color: '#DAA520', unlocked: false, unlockThreshold: 100 },
    axolotl: { name: '六角恐龙', emoji: '🦎', baseAttack: 5, baseDefense: 5, baseSpeed: 7, baseHp: 46, color: '#FF69B4', unlocked: false, unlockThreshold: 110 }
};

ANIMALS.fox.signOnly = true;
ANIMALS.phoenix.signOnly = true;

// ============ 角色专属能力 ============
// 被动只提供小幅基础增益；主动技能有明确冷却，避免压过升级技能的成长价值。
const ABILITIES = {
    cat: {
        passive: { name: '九命', desc: '最大生命 +5', bonus: { hp: 5 } },
        active: { name: '成长呼噜', desc: '最大生命 +8 并回复生命', effect: 'grow', amount: 8, cooldown: 12 }
    },
    rabbit: {
        passive: { name: '警觉', desc: '速度 +1', bonus: { speed: 1 } },
        active: { name: '蹬腿冲刺', desc: '朝面向冲刺 150 像素', effect: 'dash', distance: 150, cooldown: 8 }
    },
    fox: {
        passive: { name: '狡黠', desc: '攻击 +1', bonus: { attack: 1 } },
        active: { name: '弱点突袭', desc: '下 2 次攻击额外 +8 伤害', effect: 'empower', bonus: 8, hits: 2, cooldown: 10 }
    },
    bear: {
        passive: { name: '厚皮', desc: '防御 +1', bonus: { defense: 1 } },
        active: { name: '坚守', desc: '接下来的 3 次受击减伤 55%', effect: 'shield', hits: 3, reduction: 0.55, cooldown: 12 }
    },
    tiger: {
        passive: { name: '猎手本能', desc: '攻击 +1', bonus: { attack: 1 } },
        active: { name: '猛虎扑击', desc: '下 3 次攻击额外 +5 伤害', effect: 'empower', bonus: 5, hits: 3, cooldown: 10 }
    },
    eagle: {
        passive: { name: '锐眼', desc: '速度 +1', bonus: { speed: 1 } },
        active: { name: '俯冲', desc: '朝面向冲刺 180 像素', effect: 'dash', distance: 180, cooldown: 9 }
    },
    leopard: {
        passive: { name: '追猎', desc: '攻击 +1', bonus: { attack: 1 } },
        active: { name: '猎杀', desc: '下一次攻击额外 +16 伤害', effect: 'empower', bonus: 16, hits: 1, cooldown: 11 }
    },
    phoenix: {
        passive: { name: '余烬', desc: '最大生命 +5', bonus: { hp: 5 } },
        active: { name: '涅槃之火', desc: '回复 25% 最大生命并获得 1 次减伤', effect: 'healShield', amount: 0.25, hits: 1, reduction: 0.5, cooldown: 14 }
    },
    wolf: { passive: { name: '群猎', desc: '攻击 +1', bonus: { attack: 1 } }, active: { name: '撕咬', desc: '下 2 次攻击额外 +7 伤害', effect: 'empower', bonus: 7, hits: 2, cooldown: 10 } },
    deer: { passive: { name: '轻盈', desc: '速度 +1', bonus: { speed: 1 } }, active: { name: '跃迁', desc: '朝面向冲刺 170 像素', effect: 'dash', distance: 170, cooldown: 9 } },
    panda: { passive: { name: '圆滚滚', desc: '最大生命 +5', bonus: { hp: 5 } }, active: { name: '竹盾', desc: '接下来 2 次受击减伤 50%', effect: 'shield', hits: 2, reduction: 0.5, cooldown: 11 } },
    monkey: { passive: { name: '灵巧', desc: '速度 +1', bonus: { speed: 1 } }, active: { name: '如意一击', desc: '下 2 次攻击额外 +8 伤害', effect: 'empower', bonus: 8, hits: 2, cooldown: 10 } },
    otter: { passive: { name: '水疗', desc: '最大生命 +5', bonus: { hp: 5 } }, active: { name: '泡泡疗愈', desc: '回复 30% 最大生命', effect: 'heal', amount: 0.3, cooldown: 12 } },
    owl: { passive: { name: '夜视', desc: '攻击 +1', bonus: { attack: 1 } }, active: { name: '俯冲爪击', desc: '下一次攻击额外 +15 伤害', effect: 'empower', bonus: 15, hits: 1, cooldown: 11 } },
    boar: { passive: { name: '硬鬃', desc: '防御 +1', bonus: { defense: 1 } }, active: { name: '野蛮冲撞', desc: '朝面向冲刺 160 像素', effect: 'dash', distance: 160, cooldown: 9 } },
    elephant: { passive: { name: '厚重', desc: '防御 +1', bonus: { defense: 1 } }, active: { name: '象牙壁垒', desc: '接下来 3 次受击减伤 50%', effect: 'shield', hits: 3, reduction: 0.5, cooldown: 13 } },
    hedgehog: { passive: { name: '尖刺', desc: '防御 +1', bonus: { defense: 1 } }, active: { name: '蜷缩', desc: '接下来 3 次受击减伤 55%', effect: 'shield', hits: 3, reduction: 0.55, cooldown: 12 } },
    crane: { passive: { name: '凌空', desc: '速度 +1', bonus: { speed: 1 } }, active: { name: '振翅', desc: '朝面向冲刺 190 像素', effect: 'dash', distance: 190, cooldown: 9 } },
    giraffe: { passive: { name: '长颈', desc: '最大生命 +5', bonus: { hp: 5 } }, active: { name: '长颈突击', desc: '下 2 次攻击额外 +7 伤害', effect: 'empower', bonus: 7, hits: 2, cooldown: 10 } },
    axolotl: { passive: { name: '再生', desc: '最大生命 +5', bonus: { hp: 5 } }, active: { name: '水愈', desc: '回复 35% 最大生命', effect: 'heal', amount: 0.35, cooldown: 12 } }
};

// 第二批英雄：全部沿用“被动 + 主动”的平衡模板。它们会自动出现在图鉴、选人页、商城和敌人池中。
Object.assign(ANIMALS, {
    lion: { name: '烈焰狮', emoji: '🦁', baseAttack: 11, baseDefense: 4, baseSpeed: 5, baseHp: 48, color: '#d99132', unlocked: false },
    dog: { name: '牧羊犬', emoji: '🐕', baseAttack: 6, baseDefense: 3, baseSpeed: 8, baseHp: 38, color: '#b9825a', unlocked: false },
    raccoon: { name: '浣熊', emoji: '🦝', baseAttack: 6, baseDefense: 4, baseSpeed: 7, baseHp: 42, color: '#6c6e78', unlocked: false },
    koala: { name: '考拉', emoji: '🐨', baseAttack: 4, baseDefense: 6, baseSpeed: 4, baseHp: 55, color: '#9fa4a7', unlocked: false },
    sloth: { name: '树懒', emoji: '🦥', baseAttack: 5, baseDefense: 7, baseSpeed: 2, baseHp: 62, color: '#8a745f', unlocked: false },
    kangaroo: { name: '袋鼠', emoji: '🦘', baseAttack: 8, baseDefense: 3, baseSpeed: 9, baseHp: 40, color: '#b87545', unlocked: false },
    zebra: { name: '斑马', emoji: '🦓', baseAttack: 7, baseDefense: 4, baseSpeed: 8, baseHp: 44, color: '#e7e7e7', unlocked: false },
    hippo: { name: '河马', emoji: '🦛', baseAttack: 9, baseDefense: 8, baseSpeed: 3, baseHp: 70, color: '#817486', unlocked: false },
    rhino: { name: '犀牛', emoji: '🦏', baseAttack: 10, baseDefense: 8, baseSpeed: 3, baseHp: 66, color: '#77818a', unlocked: false },
    crocodile: { name: '鳄鱼', emoji: '🐊', baseAttack: 10, baseDefense: 5, baseSpeed: 5, baseHp: 54, color: '#51764d', unlocked: false },
    turtle: { name: '陆龟', emoji: '🐢', baseAttack: 4, baseDefense: 10, baseSpeed: 2, baseHp: 72, color: '#4e8451', unlocked: false },
    penguin: { name: '企鹅', emoji: '🐧', baseAttack: 6, baseDefense: 4, baseSpeed: 6, baseHp: 46, color: '#3f5368', unlocked: false },
    dolphin: { name: '海豚', emoji: '🐬', baseAttack: 7, baseDefense: 3, baseSpeed: 10, baseHp: 36, color: '#54b9d8', unlocked: false },
    shark: { name: '鲨鱼', emoji: '🦈', baseAttack: 12, baseDefense: 4, baseSpeed: 7, baseHp: 50, color: '#63869b', unlocked: false },
    bat: { name: '蝙蝠', emoji: '🦇', baseAttack: 7, baseDefense: 2, baseSpeed: 10, baseHp: 32, color: '#493e62', unlocked: false },
    parrot: { name: '鹦鹉', emoji: '🦜', baseAttack: 6, baseDefense: 3, baseSpeed: 9, baseHp: 34, color: '#35a965', unlocked: false },
    chameleon: { name: '变色龙', emoji: '🦎', baseAttack: 6, baseDefense: 5, baseSpeed: 6, baseHp: 45, color: '#70a447', unlocked: false },
    llama: { name: '羊驼', emoji: '🦙', baseAttack: 6, baseDefense: 5, baseSpeed: 6, baseHp: 50, color: '#d7b78a', unlocked: false },
    goat: { name: '山羊', emoji: '🐐', baseAttack: 8, baseDefense: 4, baseSpeed: 7, baseHp: 45, color: '#d5d1c1', unlocked: false },
    squirrel: { name: '松鼠', emoji: '🐿️', baseAttack: 5, baseDefense: 2, baseSpeed: 10, baseHp: 34, color: '#bf733e', unlocked: false }
});
Object.assign(ABILITIES, {
    lion: { passive:{name:'百兽之王',desc:'攻击 +2',bonus:{attack:2}}, active:{name:'狮吼震慑',desc:'接下来 2 次攻击额外 +9 伤害',effect:'empower',bonus:9,hits:2,cooldown:11}},
    dog: { passive:{name:'忠诚',desc:'最大生命 +5',bonus:{hp:5}}, active:{name:'飞扑',desc:'向前冲刺 170 像素',effect:'dash',distance:170,cooldown:9}},
    raccoon: { passive:{name:'灵巧双手',desc:'速度 +1',bonus:{speed:1}}, active:{name:'偷袭',desc:'下一次攻击额外 +15 伤害',effect:'empower',bonus:15,hits:1,cooldown:11}},
    koala: { passive:{name:'抱紧',desc:'防御 +2',bonus:{defense:2}}, active:{name:'桉叶护盾',desc:'接下来 3 次受击减伤 50%',effect:'shield',hits:3,reduction:.5,cooldown:12}},
    sloth: { passive:{name:'慢而稳',desc:'最大生命 +8',bonus:{hp:8}}, active:{name:'树藤疗愈',desc:'恢复 35% 最大生命',effect:'heal',amount:.35,cooldown:13}},
    kangaroo: { passive:{name:'弹跳',desc:'速度 +2',bonus:{speed:2}}, active:{name:'袋鼠飞踢',desc:'接下来 2 次攻击额外 +8 伤害',effect:'empower',bonus:8,hits:2,cooldown:10}},
    zebra: { passive:{name:'疾驰条纹',desc:'速度 +1',bonus:{speed:1}}, active:{name:'斑马冲锋',desc:'向前冲刺 180 像素',effect:'dash',distance:180,cooldown:9}},
    hippo: { passive:{name:'厚皮',desc:'防御 +2',bonus:{defense:2}}, active:{name:'河马守势',desc:'接下来 3 次受击减伤 55%',effect:'shield',hits:3,reduction:.55,cooldown:13}},
    rhino: { passive:{name:'犀角',desc:'攻击 +2',bonus:{attack:2}}, active:{name:'犀角冲撞',desc:'向前冲刺 180 像素',effect:'dash',distance:180,cooldown:10}},
    crocodile: { passive:{name:'伏击',desc:'攻击 +1',bonus:{attack:1}}, active:{name:'死亡翻滚',desc:'接下来 2 次攻击额外 +10 伤害',effect:'empower',bonus:10,hits:2,cooldown:11}},
    turtle: { passive:{name:'龟壳',desc:'防御 +3',bonus:{defense:3}}, active:{name:'缩壳',desc:'接下来 4 次受击减伤 55%',effect:'shield',hits:4,reduction:.55,cooldown:14}},
    penguin: { passive:{name:'冰面滑行',desc:'速度 +1',bonus:{speed:1}}, active:{name:'雪球疗愈',desc:'恢复 30% 最大生命',effect:'heal',amount:.3,cooldown:12}},
    dolphin: { passive:{name:'声呐',desc:'速度 +2',bonus:{speed:2}}, active:{name:'浪花冲刺',desc:'向前冲刺 190 像素',effect:'dash',distance:190,cooldown:9}},
    shark: { passive:{name:'猎食本能',desc:'攻击 +2',bonus:{attack:2}}, active:{name:'深海撕咬',desc:'下一次攻击额外 +18 伤害',effect:'empower',bonus:18,hits:1,cooldown:12}},
    bat: { passive:{name:'回声定位',desc:'速度 +2',bonus:{speed:2}}, active:{name:'夜袭',desc:'接下来 2 次攻击额外 +8 伤害',effect:'empower',bonus:8,hits:2,cooldown:10}},
    parrot: { passive:{name:'振翅',desc:'速度 +1',bonus:{speed:1}}, active:{name:'彩羽护体',desc:'恢复 25% 最大生命并获得 1 次减伤',effect:'healShield',amount:.25,hits:1,reduction:.5,cooldown:13}},
    chameleon: { passive:{name:'伪装',desc:'防御 +2',bonus:{defense:2}}, active:{name:'变色伏击',desc:'下一次攻击额外 +16 伤害',effect:'empower',bonus:16,hits:1,cooldown:11}},
    llama: { passive:{name:'高原耐力',desc:'最大生命 +6',bonus:{hp:6}}, active:{name:'唾沫护盾',desc:'接下来 2 次受击减伤 50%',effect:'shield',hits:2,reduction:.5,cooldown:11}},
    goat: { passive:{name:'攀岩',desc:'速度 +1',bonus:{speed:1}}, active:{name:'羊角顶撞',desc:'接下来 2 次攻击额外 +8 伤害',effect:'empower',bonus:8,hits:2,cooldown:10}},
    squirrel: { passive:{name:'囤积',desc:'速度 +2',bonus:{speed:2}}, active:{name:'松果疗愈',desc:'恢复 30% 最大生命',effect:'heal',amount:.3,cooldown:11}}
});

Object.assign(ANIMALS, {
    seal:{name:'海豹',emoji:'🦭',baseAttack:7,baseDefense:5,baseSpeed:7,baseHp:48,color:'#9fb9c5',unlocked:false},
    whale:{name:'蓝鲸',emoji:'🐋',baseAttack:11,baseDefense:8,baseSpeed:4,baseHp:78,color:'#4f82a6',unlocked:false},
    orca:{name:'虎鲸',emoji:'🐋',baseAttack:12,baseDefense:5,baseSpeed:8,baseHp:55,color:'#101114',unlocked:false},
    octopus:{name:'章鱼',emoji:'🐙',baseAttack:8,baseDefense:5,baseSpeed:6,baseHp:52,color:'#a65b9c',unlocked:false},
    jellyfish:{name:'水母',emoji:'🪼',baseAttack:6,baseDefense:3,baseSpeed:9,baseHp:38,color:'#78bfe7',unlocked:false},
    falcon:{name:'猎鹰',emoji:'🦅',baseAttack:10,baseDefense:3,baseSpeed:11,baseHp:38,color:'#8b6a48',unlocked:false},
    albatross:{name:'信天翁',emoji:'🕊️',baseAttack:7,baseDefense:4,baseSpeed:10,baseHp:44,color:'#e8eef2',unlocked:false},
    hummingbird:{name:'蜂鸟',emoji:'🐦',baseAttack:5,baseDefense:2,baseSpeed:13,baseHp:30,color:'#3fbd83',unlocked:false},
    swan:{name:'天鹅',emoji:'🦢',baseAttack:7,baseDefense:5,baseSpeed:8,baseHp:50,color:'#f7f7f7',unlocked:false}
});
Object.assign(ANIMALS, {
    condor:{name:'安第斯神鹰',emoji:'🦅',baseAttack:12,baseDefense:6,baseSpeed:7,baseHp:60,color:'#483c35',unlocked:false},
    pelican:{name:'鹈鹕',emoji:'🦢',baseAttack:7,baseDefense:7,baseSpeed:6,baseHp:66,color:'#e6e0c7',unlocked:false},
    flamingo:{name:'火烈鸟',emoji:'🦩',baseAttack:6,baseDefense:3,baseSpeed:11,baseHp:40,color:'#ef7fa8',unlocked:false},
    raven:{name:'渡鸦',emoji:'🐦‍⬛',baseAttack:9,baseDefense:4,baseSpeed:10,baseHp:42,color:'#242632',unlocked:false},
    pigeon:{name:'信鸽',emoji:'🕊️',baseAttack:5,baseDefense:3,baseSpeed:10,baseHp:34,color:'#b8c4d0',unlocked:false},
    goose:{name:'大雁',emoji:'🪿',baseAttack:8,baseDefense:6,baseSpeed:7,baseHp:54,color:'#d8d7cf',unlocked:false},
    cockatoo:{name:'凤头鹦鹉',emoji:'🦜',baseAttack:7,baseDefense:4,baseSpeed:9,baseHp:40,color:'#f3dc62',unlocked:false},
    kitebird:{name:'风筝鹰',emoji:'🦅',baseAttack:10,baseDefense:3,baseSpeed:12,baseHp:38,color:'#8d5d45',unlocked:false}
});
['seal','whale','orca','octopus','jellyfish','falcon','albatross','hummingbird','swan','condor','pelican','flamingo','raven','pigeon','goose','cockatoo','kitebird'].forEach(type => {
    const hero=ANIMALS[type];
    ABILITIES[type]=hero.baseSpeed>=10
        ? {passive:{name:'迅捷',desc:'速度 +1',bonus:{speed:1}},active:{name:'俯冲冲撞',desc:'沿面向冲撞并造成伤害',effect:'dash',distance:190,cooldown:9}}
        : {passive:{name:'猎手本能',desc:'攻击 +1',bonus:{attack:1}},active:{name:'实体突袭',desc:'发射穿透地图的实体攻击',effect:'empower',bonus:10,hits:1,cooldown:10}};
});
const OCEAN_TYPES=['dolphin','shark','seal','whale','orca','octopus','jellyfish'];
const SKY_TYPES=['eagle','owl','crane','phoenix','bat','parrot','falcon','albatross','hummingbird','swan','condor','pelican','raven','pigeon','goose','cockatoo','kitebird'];
function environmentFor(type){ return OCEAN_TYPES.includes(type)?'ocean':SKY_TYPES.includes(type)?'sky':'land'; }

// 商城价格由英雄强度决定，不再受加入游戏的先后顺序影响。
function calculateHeroPrice(hero) {
    const strength = hero.baseAttack * 2.8 + hero.baseDefense * 1.8 + hero.baseSpeed * 1.35 + hero.baseHp * 0.32;
    return Math.max(180, Math.round((strength * 12 + 40) / 10) * 10);
}
function calculateHeroPower(hero) {
    return Math.round(hero.baseAttack * 12 + hero.baseDefense * 8 + hero.baseSpeed * 7 + hero.baseHp * 1.2);
}
const HERO_RARITY_INFO = { normal:'普通', rare:'稀有', epic:'史诗', mythic:'神话', legendary:'传说' };
function heroRarity(hero) {
    const power = calculateHeroPower(hero);
    if (power >= 330) return 'legendary';
    if (power >= 300) return 'mythic';
    if (power >= 260) return 'epic';
    if (power >= 215) return 'rare';
    return 'normal';
}
function heroRarityMarkup(hero) {
    const rarity = heroRarity(hero);
    return `<span class="hero-rarity hero-rarity-${rarity}">${HERO_RARITY_INFO[rarity]}</span>`;
}
function heroesByPower(entries = Object.entries(ANIMALS)) {
    return [...entries].sort(([, a], [, b]) => calculateHeroPower(a) - calculateHeroPower(b) || a.name.localeCompare(b.name));
}
function heroIconMarkup(key, hero) {
    if (key === 'orca') return '<span class="orca-icon" role="img" aria-label="虎鲸"><i></i><b class="orca-eye-patch"></b><b class="orca-belly-patch"></b></span>';
    const raptorIcons = { eagle:'eagle', falcon:'falcon', condor:'condor', kitebird:'kite' };
    if (raptorIcons[key]) return `<span class="bird-icon bird-icon-${raptorIcons[key]}" role="img" aria-label="${hero.name}"><i></i><b></b><b></b><em></em></span>`;
    return hero.emoji;
}
function refreshHeroPrices() {
    Object.values(ANIMALS).forEach(hero => {
        if (!hero.signOnly) hero.price = calculateHeroPrice(hero);
    });
}
refreshHeroPrices();

// ============ 技能定义 ============
const SKILLS = [
    { name:'强化爪击', desc:'攻击 +4', type:'attack', value:4, rarity:'normal' }, { name:'坚硬皮肤', desc:'防御 +3', type:'defense', value:3, rarity:'normal' }, { name:'轻盈步伐', desc:'速度 +2', type:'speed', value:2, rarity:'normal' }, { name:'生命活力', desc:'最大生命 +18', type:'hp', value:18, rarity:'normal' }, { name:'自然恢复', desc:'脱战回血 +1/秒', type:'regen', value:1, rarity:'normal' }, { name:'精准感知', desc:'暴击率 +5%', type:'crit', value:.05, rarity:'normal' }, { name:'技能增幅', desc:'实体技能伤害 +10%', type:'skillPower', value:.10, rarity:'normal' }, { name:'敏捷反应', desc:'主动技能冷却 -8%', type:'cooldown', value:.08, rarity:'normal' },
    { name:'凶猛打击', desc:'攻击 +8', type:'attack', value:8, rarity:'rare' }, { name:'铁壁防守', desc:'防御 +6', type:'defense', value:6, rarity:'rare' }, { name:'闪电速度', desc:'速度 +4', type:'speed', value:4, rarity:'rare' }, { name:'生命恢复', desc:'最大生命 +35', type:'hp', value:35, rarity:'rare' }, { name:'战斗自愈', desc:'脱战回血 +3/秒', type:'regen', value:3, rarity:'rare' }, { name:'弱点洞察', desc:'暴击率 +10%', type:'crit', value:.10, rarity:'rare' }, { name:'生命汲取', desc:'普攻吸血 +5%', type:'lifesteal', value:.05, rarity:'rare' }, { name:'实体过载', desc:'实体技能伤害 +25%', type:'skillPower', value:.25, rarity:'rare' },
    { name:'猎手本能', desc:'攻击 +10，速度 +2', type:'compound', value:{attack:10,speed:2}, rarity:'epic' }, { name:'不屈护甲', desc:'防御 +10，最大生命 +40', type:'compound', value:{defense:10,hp:40}, rarity:'epic' }, { name:'疾风回响', desc:'速度 +6，主动技能冷却 -18%', type:'compound', value:{speed:6,cooldown:.18}, rarity:'epic' }, { name:'嗜血连击', desc:'攻击 +7，吸血 +12%', type:'compound', value:{attack:7,lifesteal:.12}, rarity:'epic' }, { name:'元素共鸣', desc:'实体技能伤害 +45%，暴击率 +10%', type:'compound', value:{skillPower:.45,crit:.10}, rarity:'epic' },
    { name:'神话战意', desc:'攻击 +14，暴击率 +14%', type:'compound', value:{attack:14,crit:.14}, rarity:'mythic' }, { name:'星辉护佑', desc:'防御 +14，最大生命 +65', type:'compound', value:{defense:14,hp:65}, rarity:'mythic' }, { name:'流光疾行', desc:'速度 +7，主动技能冷却 -26%', type:'compound', value:{speed:7,cooldown:.26}, rarity:'mythic' }, { name:'灵魂虹吸', desc:'攻击 +9，吸血 +18%，实体技能伤害 +25%', type:'compound', value:{attack:9,lifesteal:.18,skillPower:.25}, rarity:'mythic' },
    { name:'战神降临', desc:'攻击 +18，暴击率 +20%', type:'compound', value:{attack:18,crit:.20}, rarity:'legendary' }, { name:'不灭之躯', desc:'最大生命 +100，脱战回血 +8/秒', type:'compound', value:{hp:100,regen:8}, rarity:'legendary' }, { name:'时空掌控', desc:'速度 +8，主动技能冷却 -35%，实体技能伤害 +35%', type:'compound', value:{speed:8,cooldown:.35,skillPower:.35}, rarity:'legendary' }, { name:'全能王冠', desc:'攻击 +10，防御 +10，速度 +4，最大生命 +50', type:'compound', value:{attack:10,defense:10,speed:4,hp:50}, rarity:'legendary' }
];

const RARITY_INFO = { normal:{label:'普通',weight:55}, rare:{label:'稀有',weight:26}, epic:{label:'史诗',weight:12}, mythic:{label:'神话',weight:5}, legendary:{label:'传奇',weight:2} };

const RANK_TIERS = ['青铜', '白银', '黄金', '铂金', '钻石', '星耀', '王者'];
function loadRank() {
    return {
        tier: Math.max(0, Math.min(RANK_TIERS.length - 1, parseInt(localStorage.getItem('rankTier')) || 0)),
        division: Math.max(1, Math.min(3, parseInt(localStorage.getItem('rankDivision')) || 3)),
        stars: Math.max(0, Math.min(2, parseInt(localStorage.getItem('rankStars')) || 0))
    };
}
function rankLabel() {
    const rank = gameState.rank;
    return `${RANK_TIERS[rank.tier]} ${rank.division} · ${rank.stars} 星`;
}
function changeRankStars(delta) {
    const rank = gameState.rank;
    if (delta > 0) {
        rank.stars++;
        if (rank.stars >= 3) {
            rank.stars = 0;
            if (rank.division > 1) rank.division--;
            else if (rank.tier < RANK_TIERS.length - 1) { rank.tier++; rank.division = 3; }
        }
    } else if (rank.stars > 0) rank.stars--;
    else if (rank.division < 3) { rank.division++; rank.stars = 2; }
    else if (rank.tier > 0) { rank.tier--; rank.division = 1; rank.stars = 2; }
    localStorage.setItem('rankTier', rank.tier);
    localStorage.setItem('rankDivision', rank.division);
    localStorage.setItem('rankStars', rank.stars);
}

// ============ 游戏全局状态 ============
let gameState = {
    screen: 'hall', // hall, select, playing, levelup, gameover
    mode: 'tower',
    rank: loadRank(),
    account: {
        name: localStorage.getItem('playerName') || '',
        level: parseInt(localStorage.getItem('accountLevel')) || 1,
        exp: parseInt(localStorage.getItem('accountExp')) || 0,
        reputation: parseInt(localStorage.getItem('reputation')) || 100,
        inventory: JSON.parse(localStorage.getItem('inventory') || '{"renameCard":0}')
    },
    player: null,
    enemies: [],
    allies: [],
    particles: [],
    skillEffects: [],
    chests: [],
    obstacles: [],
    damageNumbers: [],
    provokeActive: false,
    levelUpShown: false,  // 防止升级界面重复生成
    world: {
        level: 1,
        time: 0,
        difficulty: 1
    },
    stats: {
        coins: parseInt(localStorage.getItem('coins')) || 0,
        highScore: localStorage.getItem('highScore') || 0,
        rankWins: parseInt(localStorage.getItem('rankWins')) || 0,
        killCount: 0,
        totalKillsEarned: parseInt(localStorage.getItem('totalKillsEarned')) || 0,  // 历史总击杀数
        leopardKills: parseInt(localStorage.getItem('leopardKills')) || 0,  // 已弃用，兼容旧存档
        phoenixKills: parseInt(localStorage.getItem('phoenixKills')) || 0   // 已弃用，兼容旧存档
    }
};

let controlMode = localStorage.getItem('controlMode') || 'desktop';
const mobileInput = { x: 0, y: 0, active: false };
const RANKED_RUN_SAVE_KEY = 'rankedTowerRun';
const TOWER_RUN_SAVE_KEY = 'towerRun';
let lastRankedSaveAt = 0;
let pendingSaveMode = null;

function spawnDamageNumber(target, amount, critical = false, source = '') {
    if (!target || !Number.isFinite(amount)) return;
    gameState.damageNumbers.push({
        x: target.x + (Math.random() - .5) * 24,
        y: target.y - target.radius - 8,
        amount: Math.max(0, Math.round(amount)),
        critical,
        source,
        life: 42,
        maxLife: 42
    });
}

function runSaveKey(mode = gameState.mode) { return mode === 'ranked' ? RANKED_RUN_SAVE_KEY : TOWER_RUN_SAVE_KEY; }
function serializeEnemy(enemy) {
    return {
        type: enemy.type, x: enemy.x, y: enemy.y, hp: enemy.hp, maxHp: enemy.maxHp,
        attack: enemy.attack, defense: enemy.defense, speed: enemy.speed, level: enemy.level,
        name: enemy.name, emoji: enemy.emoji, radius: enemy.radius, isBoss: !!enemy.isBoss,
        bossSkillCooldown: enemy.bossSkillCooldown, bossSkillName: enemy.bossSkillName
    };
}
function restoreSavedEnemies(savedEnemies) {
    if (!Array.isArray(savedEnemies)) return null;
    return savedEnemies.map(saved => {
        if (!saved || !ANIMALS[saved.type]) return null;
        const enemy = new Enemy(saved.type, saved.x, saved.y);
        ['hp','maxHp','attack','defense','speed','level','name','emoji','radius','bossSkillCooldown','bossSkillName'].forEach(field => {
            if (saved[field] !== undefined) enemy[field] = saved[field];
        });
        enemy.isBoss = !!saved.isBoss;
        return enemy;
    }).filter(Boolean);
}
function saveRankedRun() {
    const player = gameState.player;
    if (!['ranked','tower'].includes(gameState.mode) || gameState.screen !== 'playing' || !player) return;
    const fields = ['x','y','level','exp','expToLevel','attack','defense','speed','maxHp','hp','skills','regenBonus','critChance','lifesteal','skillPower','activeCooldownReduction','activeCooldown','empoweredHits','empoweredDamage','shieldHits','shieldReduction'];
    const playerState = { type: player.type };
    fields.forEach(field => { playerState[field] = player[field]; });
    localStorage.setItem(runSaveKey(), JSON.stringify({
        player: playerState,
        level: gameState.world.level,
        time: gameState.world.time,
        killCount: gameState.stats.killCount,
        skillRerolls: gameState.skillRerolls || 0,
        chestAvailable: gameState.world.level === 1 && gameState.chests.length > 0,
        provokeActive: !!gameState.provokeActive,
        enemies: gameState.enemies.map(serializeEnemy),
        savedAt: Date.now()
    }));
}

function getSavedRankedRun(mode = gameState.mode) {
    try {
        const saved = JSON.parse(localStorage.getItem(runSaveKey(mode)) || 'null');
        return saved && saved.player && ANIMALS[saved.player.type] ? saved : null;
    } catch (_) {
        localStorage.removeItem(runSaveKey(mode));
        return null;
    }
}

function clearRankedRun(mode = gameState.mode) { localStorage.removeItem(runSaveKey(mode)); }

function resumeRankedRun(mode = 'ranked') {
    const saved = getSavedRankedRun(mode);
    if (!saved) return false;
    gameState.mode = mode;
    gameState.screen = 'playing';
    document.getElementById('hallModal').classList.add('hidden');
    document.getElementById('saveChoiceModal').classList.add('hidden');
    startGame(saved.player.type, saved);
    return true;
}

function updateControlLayout() {
    const joystick = document.getElementById('mobileJoystick');
    if (!joystick) return;
    joystick.style.display = gameState.screen === 'playing' && controlMode === 'mobile' ? 'block' : 'none';
}

async function toggleFullscreen() {
    const container = document.getElementById('gameContainer');
    try {
        if (document.fullscreenElement || document.webkitFullscreenElement) await (document.exitFullscreen?.() || document.webkitExitFullscreen?.());
        else await (container.requestFullscreen?.() || container.webkitRequestFullscreen?.());
    } catch (_) { window.alert('当前浏览器不支持全屏，请使用浏览器的全屏按钮。'); }
}
function enterGameFullscreen() {
    const container = document.getElementById('gameContainer');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) container.requestFullscreen?.().catch?.(() => {});
}
function exitGameFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen?.() || document.webkitExitFullscreen?.()).catch?.(() => {});
}
function setControlMode(mode) {
    controlMode = mode === 'mobile' ? 'mobile' : 'desktop';
    localStorage.setItem('controlMode', controlMode);
    mobileInput.x = 0; mobileInput.y = 0; mobileInput.active = false;
    const stick = document.getElementById('joystickStick');
    if (stick) stick.style.transform = 'translate(0, 0)';
    updateControlLayout();
    showHall();
}

// 检查隐藏角色解锁
function checkUnlocks() {
    const saved = JSON.parse(localStorage.getItem('unlockedHeroes') || '[]');
    saved.forEach(key => { if (ANIMALS[key]) ANIMALS[key].unlocked = true; });
}
function saveUnlockedHeroes() {
    localStorage.setItem('unlockedHeroes', JSON.stringify(Object.keys(ANIMALS).filter(key => ANIMALS[key].unlocked)));
}

// ============ 画布和上下文 ============
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
let nextParticleId = 1;

// ============ 3D 渲染层 ============
// 3D 库异步加载；失败时保留原 Canvas 画面，保证游戏仍可游玩。
let render3DReady = false;
let Three, threeRenderer, threeScene, threeCamera, threeMeshes, threeLabels, threeNature, threeGround, threeGrid, threeOceanDecor;

async function init3DRenderer() {
    try {
        const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js');
        Three = THREE;
        const container = document.getElementById('gameContainer');
        threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        threeRenderer.setSize(GAME_WIDTH, GAME_HEIGHT, false);
        threeRenderer.domElement.className = 'three-canvas';
        container.appendChild(threeRenderer.domElement);
        threeLabels = document.createElement('div');
        threeLabels.className = 'three-labels';
        container.appendChild(threeLabels);

        threeScene = new THREE.Scene();
        threeScene.background = new THREE.Color('#87b9e8');
        threeScene.fog = new THREE.Fog('#87b9e8', 16, 42);
        threeCamera = new THREE.PerspectiveCamera(48, GAME_WIDTH / GAME_HEIGHT, 0.1, 100);
        threeCamera.position.set(0, 17, 16);
        threeCamera.lookAt(0, 0, 0);
        threeScene.add(new THREE.HemisphereLight(0xffffff, 0x355341, 2.2));
        const sun = new THREE.DirectionalLight(0xfff1ca, 2.5);
        sun.position.set(-8, 14, 7);
        threeScene.add(sun);

        threeGround = new THREE.Mesh(new THREE.PlaneGeometry(26, 19), new THREE.MeshStandardMaterial({ color: 0x579c63, roughness: 0.95 }));
        threeGround.rotation.x = -Math.PI / 2;
        threeScene.add(threeGround);
        threeGrid = new THREE.GridHelper(26, 13, 0x8fcf91, 0x75b57d);
        threeGrid.position.y = 0.01;
        threeScene.add(threeGrid);
        // 大草原自然景物：低多边形树、石头与灌木，固定种子让每局地图稳定。
        const nature = new THREE.Group();
        gameState.obstacles = [];
        for (let i = 0; i < 38; i++) {
            const x = (Math.random() - .5) * 24, z = (Math.random() - .5) * 17;
            // 模型看起来比实际碰撞范围大一些，避免角色经过树木、石头时被卡住。
            if (i % 3 !== 2) gameState.obstacles.push({ x:x * 42 + GAME_WIDTH / 2, y:z * 42 + GAME_HEIGHT / 2, radius:i % 3 === 0 ? 20 : 14 });
            if (i % 3 === 0) {
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.1, .16, .75, 6), new THREE.MeshStandardMaterial({ color: 0x70452d, flatShading: true }));
                const crown = new THREE.Mesh(new THREE.ConeGeometry(.48, 1.15, 7), new THREE.MeshStandardMaterial({ color: 0x2f7b43, flatShading: true }));
                trunk.position.set(x, .38, z); crown.position.set(x, 1.1, z); nature.add(trunk, crown);
            } else if (i % 3 === 1) {
                const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.18 + Math.random() * .22, 0), new THREE.MeshStandardMaterial({ color: 0x7a7f78, flatShading: true }));
                rock.position.set(x, .16, z); nature.add(rock);
            } else {
                const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(.28, 1), new THREE.MeshStandardMaterial({ color: 0x4e9a50, flatShading: true }));
                bush.position.set(x, .25, z); nature.add(bush);
            }
        }
        threeNature = nature;
        threeScene.add(nature);
        // 海洋场景装饰：珊瑚、海草和上浮气泡，只负责视觉效果，不会阻挡角色。
        const oceanDecor = new THREE.Group();
        const coralMaterials = [0xff847c, 0xffc06a, 0xa36ddd];
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - .5) * 24, z = (Math.random() - .5) * 17;
            if (i % 2 === 0) {
                const coralMat = new THREE.MeshStandardMaterial({ color: coralMaterials[i % coralMaterials.length], roughness:.75, flatShading:true });
                for (let branch = -1; branch <= 1; branch++) {
                    const coral = new THREE.Mesh(new THREE.ConeGeometry(.1 + Math.abs(branch) * .03, .55 + Math.random() * .35, 6), coralMat);
                    coral.position.set(x + branch * .12, .3, z + Math.abs(branch) * .08);
                    coral.rotation.z = branch * .35;
                    oceanDecor.add(coral);
                }
            } else {
                const seaweedMat = new THREE.MeshStandardMaterial({ color: 0x237c68, roughness:.85, flatShading:true });
                for (let blade = -1; blade <= 1; blade++) {
                    const seaweed = new THREE.Mesh(new THREE.CylinderGeometry(.025, .045, .65 + Math.random() * .32, 5), seaweedMat);
                    seaweed.position.set(x + blade * .1, .35, z);
                    seaweed.rotation.z = blade * .24;
                    oceanDecor.add(seaweed);
                }
            }
        }
        // 珊瑚礁群：礁石基座、扇形珊瑚和高低分枝，让海底有明确的景深层次。
        const reefRockMat = new THREE.MeshStandardMaterial({ color:0x586d70, roughness:.95, flatShading:true });
        const fanCoralMat = new THREE.MeshStandardMaterial({ color:0xef6f91, emissive:0x55202e, emissiveIntensity:.18, roughness:.7, flatShading:true, side:THREE.DoubleSide });
        for (let reef = 0; reef < 7; reef++) {
            const x = (Math.random() - .5) * 22, z = (Math.random() - .5) * 15;
            for (let rock = 0; rock < 3; rock++) {
                const base = new THREE.Mesh(new THREE.DodecahedronGeometry(.28 + Math.random() * .25, 0), reefRockMat);
                base.position.set(x + (Math.random() - .5) * .75, .18, z + (Math.random() - .5) * .6);
                base.scale.y = .65;
                oceanDecor.add(base);
            }
            const fan = new THREE.Mesh(new THREE.CircleGeometry(.35 + Math.random() * .16, 8), fanCoralMat);
            fan.position.set(x, .65, z + .12); fan.rotation.y = (Math.random() - .5) * .6;
            oceanDecor.add(fan);
            const purpleMat = new THREE.MeshStandardMaterial({ color:0x8e6ad6, roughness:.7, flatShading:true });
            for (let branch = -2; branch <= 2; branch++) {
                const stalk = new THREE.Mesh(new THREE.CylinderGeometry(.045, .075, .55 + Math.random() * .4, 6), purpleMat);
                stalk.position.set(x + branch * .11, .42, z - .12 + Math.abs(branch) * .04);
                stalk.rotation.z = branch * .13;
                oceanDecor.add(stalk);
            }
        }
        const bubbleMat = new THREE.MeshStandardMaterial({ color:0xc5f4ff, emissive:0x4ba9c8, emissiveIntensity:.35, transparent:true, opacity:.65, roughness:.25 });
        for (let i = 0; i < 24; i++) {
            const bubble = new THREE.Mesh(new THREE.SphereGeometry(.035 + Math.random() * .055, 7, 6), bubbleMat);
            bubble.position.set((Math.random() - .5) * 24, .35 + Math.random() * 2.2, (Math.random() - .5) * 17);
            bubble.userData.isOceanBubble = true;
            bubble.userData.bubbleSpeed = .003 + Math.random() * .006;
            oceanDecor.add(bubble);
        }
        threeOceanDecor = oceanDecor;
        threeScene.add(oceanDecor);
        threeMeshes = new Map();
        render3DReady = true;
        applySceneEnvironment();
    } catch (error) {
        console.warn('3D 渲染加载失败，已回退至 2D。', error);
    }
}

function applySceneEnvironment() {
    const ocean = gameState.environment === 'ocean';
    const sky = gameState.environment === 'sky';
    if (threeNature) threeNature.visible = !ocean && !sky;
    if (threeOceanDecor) threeOceanDecor.visible = ocean;
    if (threeGrid) threeGrid.visible = !ocean;
    if (threeGround) threeGround.material.color.setHex(ocean ? 0xbba76e : sky ? 0xbce8ff : 0x579c63);
    if (threeScene && Three) {
        const color = ocean ? 0x1d6f9d : sky ? 0x91d5ff : 0x87b9e8;
        threeScene.background = new Three.Color(color); threeScene.fog.color = new Three.Color(color);
    }
}

function toWorld(entity) { return { x: (entity.x - GAME_WIDTH / 2) / 42, z: (entity.y - GAME_HEIGHT / 2) / 42 }; }
function build3DMesh(entity, kind) {
    const group = new Three.Group();
    const color = entity.color || (entity.type === 'exp' ? '#ffd84d' : '#ff4f92');
    const material = new Three.MeshStandardMaterial({ color, roughness: 0.72, flatShading: true });
    const dark = new Three.MeshStandardMaterial({ color: 0x2a2030, roughness: 0.8, flatShading: true });
    const light = new Three.MeshStandardMaterial({ color: 0xfff5e5, roughness: 0.72, flatShading: true });
    const add = (geometry, mat, x, y, z, sx = 1, sy = 1, sz = 1) => {
        const mesh = new Three.Mesh(geometry, mat);
        mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); group.add(mesh); return mesh;
    };
    if (kind === 'particle') {
        const rewardColor = entity.chestReward ? '#ffffff' : color;
        const glow = new Three.MeshStandardMaterial({ color: rewardColor, emissive: rewardColor, emissiveIntensity: entity.chestReward ? 1.8 : 1.2, roughness: 0.3 });
        add(new Three.IcosahedronGeometry(0.2, 1), glow, 0, 0.45, 0);
        threeScene.add(group); return group;
    }
    if (kind === 'chest') {
        const box = new Three.Mesh(new Three.BoxGeometry(.6, .42, .45), new Three.MeshStandardMaterial({ color: 0x8b4a21, roughness: .7 }));
        const lid = new Three.Mesh(new Three.BoxGeometry(.62, .16, .47), new Three.MeshStandardMaterial({ color: 0xc77b2b, emissive: 0x442000 }));
        const lock = new Three.Mesh(new Three.BoxGeometry(.12, .16, .04), new Three.MeshStandardMaterial({ color: 0xffd64a, emissive: 0x665000 }));
        box.position.y=.25; lid.position.y=.54; lock.position.set(0,.43,-.24); group.add(box,lid,lock); threeScene.add(group); return group;
    }
    if (kind === 'skill') {
        const skillMat = new Three.MeshStandardMaterial({ color: entity.color, emissive: entity.color, emissiveIntensity: 1.25, roughness: .25 });
        if (entity.kind === 'aura') {
            const ring = new Three.Mesh(new Three.TorusGeometry(entity.radius / 42, .055, 7, 16), skillMat);
            ring.rotation.x = -Math.PI / 2; ring.position.y = .09; group.add(ring);
        } else {
            add(new Three.IcosahedronGeometry(entity.radius / 55, 1), skillMat, 0, .42, 0);
        }
        threeScene.add(group); return group;
    }

    if (kind !== 'particle' && entity.type === 'seal') {
        const fur = new Three.MeshStandardMaterial({ color:0xaebbc2, roughness:.82, flatShading:true });
        const belly = new Three.MeshStandardMaterial({ color:0xe5edf0, roughness:.8, flatShading:true });
        const body = add(new Three.SphereGeometry(.43, 12, 8), fur, 0, .47, .1, 1.18, .72, 1.7);
        add(new Three.SphereGeometry(.32, 11, 8), fur, 0, .63, -.53, 1, .95, .9);
        add(new Three.SphereGeometry(.22, 10, 7), belly, 0, .35, -.58, 1.05, .45, .45);
        add(new Three.SphereGeometry(.045, 7, 6), dark, -.12, .72, -.78);
        add(new Three.SphereGeometry(.045, 7, 6), dark, .12, .72, -.78);
        add(new Three.SphereGeometry(.06, 7, 6), dark, 0, .61, -.84, 1.15, .55, .65);
        [-1, 1].forEach(side => {
            const flipper = add(new Three.SphereGeometry(.18, 8, 6), fur, side * .48, .37, .06, .42, .22, .95);
            flipper.rotation.z = side * .45;
        });
        // 海豹明显分叉的后鳍尾巴，放在身体后方而不是藏在身体里面。
        [-1, 1].forEach(side => {
            const rearFlipper = add(new Three.SphereGeometry(.18, 8, 6), fur, side * .19, .42, 1.02, .7, .22, 1.35);
            rearFlipper.rotation.z = side * .5;
        });
        [-1, 1].forEach(side => {
            const whisker = add(new Three.CylinderGeometry(.008, .008, .26, 4), light, side * .14, .59, -.86);
            whisker.rotation.z = side * Math.PI / 2.7;
        });
        group.userData = { flying:false, swimming:true, wings:[], legs:[], body };
        threeScene.add(group); return group;
    }

    if (kind !== 'particle' && entity.type === 'jellyfish') {
        const bell = add(new Three.SphereGeometry(.48, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), material, 0, .72, 0, 1.15, .9, 1.15);
        const inner = new Three.MeshStandardMaterial({ color: 0xc9eeff, emissive: 0x3d8bb0, emissiveIntensity: .35, transparent: true, opacity: .7, roughness: .45 });
        add(new Three.SphereGeometry(.25, 10, 6), inner, 0, .58, 0, 1, .45, 1);
        [-.28, -.1, .1, .28].forEach((x, index) => {
            const tentacle = add(new Three.CylinderGeometry(.027, .045, .64 + (index % 2) * .12, 6), material, x, .22, .06 * (index % 2 ? 1 : -1));
            tentacle.rotation.z = x * .7;
        });
        add(new Three.SphereGeometry(.045, 7, 6), dark, -.13, .69, -.4);
        add(new Three.SphereGeometry(.045, 7, 6), dark, .13, .69, -.4);
        group.userData = { flying:false, swimming:true, wings:[], legs:[], body:bell };
        threeScene.add(group); return group;
    }

    if (kind !== 'particle' && entity.type === 'octopus') {
        const head = add(new Three.SphereGeometry(.45, 12, 9), material, 0, .74, -.03, 1, 1.15, 1);
        const mantle = add(new Three.SphereGeometry(.34, 11, 8), material, 0, .43, .06, 1.1, .65, 1.05);
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const arm = add(new Three.ConeGeometry(.07, .68, 6), material, Math.cos(angle) * .28, .22, Math.sin(angle) * .28, 1, 1, 1);
            arm.rotation.z = Math.cos(angle) * .95;
            arm.rotation.x = Math.sin(angle) * .95;
        }
        add(new Three.SphereGeometry(.06, 7, 6), light, -.16, .78, -.4);
        add(new Three.SphereGeometry(.06, 7, 6), light, .16, .78, -.4);
        add(new Three.SphereGeometry(.025, 6, 5), dark, -.16, .78, -.45);
        add(new Three.SphereGeometry(.025, 6, 5), dark, .16, .78, -.45);
        group.userData = { flying:false, swimming:true, wings:[], legs:[], body:head };
        threeScene.add(group); return group;
    }

    // 鲨鱼采用横向鱼身、尾鳍、背鳍和胸鳍，不再使用四脚动物的通用身体。
    if (kind !== 'particle' && OCEAN_TYPES.includes(entity.type)) {
        const sharkBody = add(new Three.SphereGeometry(.42, 12, 8), material, 0, .53, .05, 1.5, .7, 2.25);
        add(new Three.SphereGeometry(.055, 7, 6), dark, -.16, .64, -.7);
        add(new Three.SphereGeometry(.055, 7, 6), dark, .16, .64, -.7);
        const belly = new Three.MeshStandardMaterial({ color: 0xdde6e8, roughness: .8, flatShading: true });
        add(new Three.SphereGeometry(.28, 10, 6), belly, 0, .38, -.05, 1.35, .25, 1.9);
        if (entity.type === 'orca') {
            // 虎鲸的醒目白色眼斑、侧腹白斑和白色腹部。
            add(new Three.SphereGeometry(.17, 9, 7), belly, -.27, .72, -.62, 1.25, .62, .22);
            add(new Three.SphereGeometry(.17, 9, 7), belly, .27, .72, -.62, 1.25, .62, .22);
            add(new Three.SphereGeometry(.22, 10, 7), belly, -.43, .56, -.18, .35, .72, 1.1);
            add(new Three.SphereGeometry(.22, 10, 7), belly, .43, .56, -.18, .35, .72, 1.1);
        }
        const fin = (x, y, z, scaleX, rotationZ = 0) => {
            const part = add(new Three.ConeGeometry(.18, .62, 4), material, x, y, z, scaleX, 1, 1);
            part.rotation.z = rotationZ; return part;
        };
        fin(0, .95, .12, 1, 0); // 背鳍
        fin(-.48, .47, -.02, 1, -.95); fin(.48, .47, -.02, 1, .95); // 胸鳍
        const tail = new Three.Mesh(new Three.ConeGeometry(.34, .7, 4), material);
        tail.position.set(0, .54, .96); tail.rotation.x = Math.PI / 2; group.add(tail);
        group.userData.flying = false;
        group.userData.swimming = true;
        group.userData.wings = [];
        group.userData.legs = [];
        group.userData.body = sharkBody;
        threeScene.add(group);
        return group;
    }

    const size = entity.isBoss ? 1.55 : 1;
    const sphere = new Three.SphereGeometry(0.42, 10, 8);
    const head = add(sphere, material, 0, 0.62 * size, -0.05, size, size, size);
    add(new Three.SphereGeometry(0.35, 10, 8), material, 0, 0.36 * size, 0.18, 1.15 * size, 0.82 * size, 1.35 * size);
    // 所有英雄共用眼睛与脚；下面按类型追加辨识度极高的部件。
    add(new Three.SphereGeometry(0.055, 7, 6), dark, -0.14 * size, 0.68 * size, -0.36 * size);
    add(new Three.SphereGeometry(0.055, 7, 6), dark, 0.14 * size, 0.68 * size, -0.36 * size);
    // 四条腿会在移动时交替前后迈步；飞行英雄则由翅膀动作取代。
    const legs = [];
    [-0.21, 0.21].forEach(x => [-0.18, 0.25].forEach(z => {
        const leg = add(new Three.CylinderGeometry(0.065, 0.085, 0.23, 6), dark, x * size, 0.12 * size, z * size);
        legs.push(leg);
    }));
    const ear = (x, tall = 0.28, wide = 0.14) => add(new Three.ConeGeometry(wide * size, tall * size, 4), material, x * size, (0.98 + tall / 2) * size, 0);
    const wing = (x, colorMat = material) => { const w = add(new Three.ConeGeometry(0.28 * size, 0.75 * size, 3), colorMat, x * size, 0.54 * size, 0.18 * size); w.rotation.z = x < 0 ? -1.25 : 1.25; };
    const type = entity.type;
    if (['cat','fox','wolf','tiger','leopard','lion','dog','raccoon','squirrel'].includes(type)) { ear(-0.25); ear(0.25); add(new Three.ConeGeometry(0.1 * size, 0.4 * size, 6), material, 0, 0.33 * size, 0.7 * size).rotation.x = Math.PI / 2; }
    if (type === 'rabbit') { ear(-0.18, 0.6, 0.1); ear(0.18, 0.6, 0.1); }
    if (type === 'bear' || type === 'panda') { add(new Three.SphereGeometry(0.15, 8, 6), dark, -0.27 * size, 0.96 * size, 0); add(new Three.SphereGeometry(0.15, 8, 6), dark, 0.27 * size, 0.96 * size, 0); }
    if (type === 'panda') { add(new Three.SphereGeometry(0.16, 8, 6), dark, -0.15 * size, 0.68 * size, -0.33 * size, 1.3, .8, .3); add(new Three.SphereGeometry(0.16, 8, 6), dark, 0.15 * size, 0.68 * size, -0.33 * size, 1.3, .8, .3); }
    if (['deer','giraffe','zebra','llama','goat'].includes(type)) { ear(-0.22); ear(0.22); [-0.17, 0.17].forEach(x => { const horn = add(new Three.CylinderGeometry(.025 * size, .04 * size, .5 * size, 5), dark, x * size, 1.23 * size, 0); horn.rotation.z = x * .35; }); }
    if (type === 'elephant') { add(new Three.SphereGeometry(.26, 8, 6), material, -.38 * size, .63 * size, -.04 * size, 1.2, .5, .15); add(new Three.SphereGeometry(.26, 8, 6), material, .38 * size, .63 * size, -.04 * size, 1.2, .5, .15); const trunk = add(new Three.CylinderGeometry(.09 * size, .12 * size, .62 * size, 7), material, 0, .36 * size, -.43 * size); trunk.rotation.x = .7; }
    if (type === 'boar') { [-.16,.16].forEach(x => { const tusk=add(new Three.ConeGeometry(.06*size,.34*size,5),light,x*size,.44*size,-.42*size); tusk.rotation.x=-1.3; }); }
    if (type === 'hedgehog') { for(let i=-3;i<=3;i++){ const spike=add(new Three.ConeGeometry(.11*size,.52*size,5),dark,i*.1*size,.77*size,.15*size); spike.rotation.z=i*.16; } }
    if (type === 'monkey') { add(new Three.SphereGeometry(.13,8,6),material,-.3*size,.78*size,0); add(new Three.SphereGeometry(.13,8,6),material,.3*size,.78*size,0); const tail=add(new Three.TorusGeometry(.28*size,.045*size,6,10,Math.PI),material,0,.42*size,.55*size); tail.rotation.x=Math.PI/2; }
    if (type === 'otter' || type === 'axolotl') { const tail=add(new Three.ConeGeometry(.18*size,.65*size,5),material,0,.36*size,.65*size); tail.rotation.x=Math.PI/2; if(type==='axolotl') [-.38,.38].forEach(x=>add(new Three.ConeGeometry(.08*size,.28*size,4),new Three.MeshStandardMaterial({color:0xff6fae}),x*size,.75*size,0)); }
    if (['eagle','owl','crane','phoenix','falcon','albatross','hummingbird','swan','condor','pelican','flamingo','raven','pigeon','goose','cockatoo','kitebird'].includes(type)) { wing(-.48); wing(.48); add(new Three.ConeGeometry(.11*size,.35*size,4), type==='phoenix' ? new Three.MeshStandardMaterial({color:0xff5b2e,emissive:0x551100}) : new Three.MeshStandardMaterial({color:0xffcc4a}), 0,.62*size,-.44*size).rotation.x=-Math.PI/2; }
    if (type === 'flamingo') {
        // 火烈鸟是涉水地面鸟：长腿行走，不会漂浮在天空场景。
        legs.forEach(leg => group.remove(leg)); legs.length = 0;
        [-.13, .13].forEach(x => {
            const longLeg = add(new Three.CylinderGeometry(.032 * size, .04 * size, .78 * size, 6), material, x * size, .2 * size, .08 * size);
            legs.push(longLeg);
        });
        const neck = add(new Three.CylinderGeometry(.07 * size, .1 * size, .62 * size, 7), material, 0, 1.02 * size, .04 * size);
        neck.rotation.z = -.22;
    }
    if (type === 'owl') { add(new Three.SphereGeometry(.16,8,6),light,-.15*size,.72*size,-.34*size); add(new Three.SphereGeometry(.16,8,6),light,.15*size,.72*size,-.34*size); }
    if (type === 'crane') { const neck=add(new Three.CylinderGeometry(.08*size,.12*size,.7*size,7),light,0,1.05*size,.08*size); neck.rotation.z=.18; }
    if (type === 'phoenix') { for(let i=-2;i<=2;i++){ const flame=add(new Three.ConeGeometry(.1*size,.55*size,5),new Three.MeshStandardMaterial({color:0xff5b2e,emissive:0xaa2200,emissiveIntensity:.6}),i*.12*size,1.1*size,.2*size); flame.rotation.z=i*.18; } }
    if (['goat','rhino','llama'].includes(type)) [-.16,.16].forEach(x => { const horn=add(new Three.ConeGeometry(.075*size,.38*size,5),light,x*size,1.12*size,-.03*size); horn.rotation.z=x*.55; });
    if (type === 'turtle') add(new Three.SphereGeometry(.42,10,7),new Three.MeshStandardMaterial({color:0x315f35,roughness:.8,flatShading:true}),0,.48*size,.23*size,1.15*size,.65*size,1.3*size);
    if (['bat','parrot'].includes(type)) { wing(-.48); wing(.48); }
    if (['shark','dolphin','crocodile'].includes(type)) { const fin=add(new Three.ConeGeometry(.16*size,.45*size,4),material,0,.78*size,.35*size); fin.rotation.x=-.2; }
    if (kind === 'player') {
        const marker = add(new Three.ConeGeometry(.22, .55, 4), new Three.MeshStandardMaterial({ color: 0xffe04b, emissive: 0x886000, emissiveIntensity: .8 }), 0, 1.65 * size, 0);
        marker.rotation.x = Math.PI;
        group.userData.playerMarker = marker;
    }
    if (entity.isBoss) { const crown = add(new Three.ConeGeometry(.38 * size, .55 * size, 5), new Three.MeshStandardMaterial({ color: 0xffd54a, emissive: 0x775500 }), 0, 1.65 * size, 0); crown.rotation.y = Math.PI / 5; }
    group.userData.flying = ['eagle', 'owl', 'crane', 'phoenix', 'bat', 'parrot', 'falcon', 'albatross', 'hummingbird', 'swan', 'condor', 'pelican', 'raven', 'pigeon', 'goose', 'cockatoo', 'kitebird'].includes(type);
    group.userData.wings = group.children.filter(child => child.geometry && child.geometry.type === 'ConeGeometry' && Math.abs(child.rotation.z) > 1);
    group.userData.legs = legs;
    group.userData.body = head;
    threeScene.add(group);
    return group;
}

function render3D() {
    if (!render3DReady) return;
    if (threeOceanDecor?.visible) {
        threeOceanDecor.children.forEach(item => {
            if (!item.userData.isOceanBubble) return;
            item.position.y += item.userData.bubbleSpeed;
            if (item.position.y > 2.9) item.position.y = .18;
        });
    }
    const active = new Set();
    const sync = (entity, kind, id) => {
        active.add(id);
        let mesh = threeMeshes.get(id);
        if (!mesh) { mesh = build3DMesh(entity, kind); threeMeshes.set(id, mesh); }
        const pos = toWorld(entity);
        const phase = performance.now() * 0.008 + entity.x * 0.03;
        const flying = mesh.userData.flying;
        const moving = Math.hypot(entity.vx || 0, entity.vy || 0) > .05;
        mesh.position.set(pos.x, flying ? .8 + Math.sin(phase) * .12 : moving ? Math.abs(Math.sin(phase * 2)) * .09 : 0, pos.z);
        if (mesh.userData.playerMarker) mesh.userData.playerMarker.position.y = 1.65 + Math.sin(phase * 2) * .08;
        // 地面英雄朝移动方向行走，不再原地持续旋转；掉落物保留旋转效果。
        if (kind === 'particle') mesh.rotation.y += 0.12;
        else if (Math.hypot(entity.vx || 0, entity.vy || 0) > 0.05) mesh.rotation.y = Math.atan2(entity.vx, entity.vy) + Math.PI;
        if (flying) mesh.userData.wings.forEach((wing, index) => { wing.rotation.z = (index ? 1 : -1) * (1.0 + Math.sin(phase * 2.5) * .5); });
    if (!flying && mesh.userData.legs) mesh.userData.legs.forEach((leg, index) => {
            leg.rotation.x = moving ? Math.sin(phase * 3 + (index % 2 ? Math.PI : 0)) * .65 : 0;
        });
        if (mesh.userData.swimming) mesh.rotation.z = moving ? Math.sin(phase * 2.2) * .08 : 0;
        // 爪击、啄击与冲撞都用短促的前探动作表现；Boss 咆哮时会明显放大。
        if (entity.attackFlash > 0) {
            const hit = Math.min(1, entity.attackFlash / 10);
            mesh.scale.setScalar(1 + (entity.bossRoar ? .18 : .06) * hit);
            mesh.position.z -= (entity.bossRoar ? .22 : .1) * hit;
        } else mesh.scale.setScalar(1);
    };
    if (gameState.screen === 'playing' && gameState.player) {
        sync(gameState.player, 'player', 'player');
        gameState.allies.forEach((ally, index) => sync(ally, 'ally', `ally-${index}-${ally.type}`));
        gameState.enemies.forEach((enemy, index) => sync(enemy, 'enemy', `enemy-${index}-${enemy.type}`));
        gameState.particles.forEach(particle => sync(particle, 'particle', `particle-${particle.id}`));
        gameState.skillEffects.forEach((effect, index) => sync(effect, 'skill', `skill-${index}`));
        gameState.chests.forEach((chest, index) => sync(chest, 'chest', `chest-${index}`));
    }
    threeMeshes.forEach((mesh, id) => { if (!active.has(id)) { threeScene.remove(mesh); threeMeshes.delete(id); } });
    threeRenderer.render(threeScene, threeCamera);
    renderEnemyLabels();
}

function renderEnemyLabels() {
    if (!threeLabels) return;
    threeLabels.innerHTML = '';
    if (gameState.screen !== 'playing') return;
    const active = gameState.player?.activeAbility;
    if (active?.effect === 'dash' && gameState.player.activeCooldown <= 0) {
        const player = gameState.player;
        const start = new Three.Vector3(toWorld(player).x, .14, toWorld(player).z).project(threeCamera);
        const target = { x: player.x + player.facing.x * active.distance, y: player.y + player.facing.y * active.distance };
        const end = new Three.Vector3(toWorld(target).x, .14, toWorld(target).z).project(threeCamera);
        const x1=(start.x*.5+.5)*100, y1=(-start.y*.5+.5)*100, x2=(end.x*.5+.5)*100, y2=(-end.y*.5+.5)*100;
        const aim=document.createElement('div'); aim.className='dash-aim'; aim.style.left=`${x1}%`; aim.style.top=`${y1}%`;
        aim.style.width=`${Math.hypot(x2-x1,y2-y1)}%`; aim.style.transform=`rotate(${Math.atan2(y2-y1,x2-x1)}rad)`;
        threeLabels.appendChild(aim);
    }
    gameState.enemies.forEach(enemy => {
        const pos = toWorld(enemy);
        const point = new Three.Vector3(pos.x, enemy.isBoss ? 2.8 : 1.35, pos.z).project(threeCamera);
        if (point.z < -1 || point.z > 1) return;
        const label = document.createElement('div');
        label.className = `enemy-label${enemy.isBoss ? ' boss' : ''}`;
        label.style.left = `${(point.x * .5 + .5) * 100}%`;
        label.style.top = `${(-point.y * .5 + .5) * 100}%`;
        const percent = Math.max(0, Math.min(100, enemy.hp / enemy.maxHp * 100));
        label.innerHTML = `<span>${enemy.isBoss ? '👑 ' : ''}Lv.${enemy.level} ${enemy.name}${enemy.lastActionText && enemy.attackFlash > 0 ? ` · ${enemy.lastActionText}` : ''}</span><div class="enemy-hp"><i style="width:${percent}%"></i></div>`;
        threeLabels.appendChild(label);
    });
    gameState.allies.forEach(ally => {
        const pos=toWorld(ally), point=new Three.Vector3(pos.x,1.35,pos.z).project(threeCamera);
        const label=document.createElement('div'); label.className='enemy-label'; label.style.left=`${(point.x*.5+.5)*100}%`; label.style.top=`${(-point.y*.5+.5)*100}%`;
        label.innerHTML=`<span style="color:#8fd3ff">队友 Lv.${ally.level}</span><div class="enemy-hp"><i style="width:${Math.max(0,ally.hp/ally.maxHp*100)}%;background:#3599ff"></i></div>`; threeLabels.appendChild(label);
    });
    // 宝箱奖励会显示明确的文字，和普通小经验点区分开。
    gameState.particles.filter(p => p.chestReward).forEach(particle => {
        const pos = toWorld(particle), point = new Three.Vector3(pos.x,.75,pos.z).project(threeCamera);
        if (point.z < -1 || point.z > 1) return;
        const label = document.createElement('div');
        label.className = 'enemy-label chest-reward';
        label.style.left = `${(point.x*.5+.5)*100}%`; label.style.top = `${(-point.y*.5+.5)*100}%`;
        label.innerHTML = `<span>${particle.type === 'heal' ? `HP+${particle.value}` : `EXP+${particle.value}`}</span>`;
        threeLabels.appendChild(label);
    });
    gameState.damageNumbers.forEach(number => {
        const pos = toWorld(number);
        const point = new Three.Vector3(pos.x, 1.35, pos.z).project(threeCamera);
        if (point.z < -1 || point.z > 1) return;
        const label = document.createElement('div');
        label.className = `damage-number${number.critical ? ' critical' : ''}`;
        label.style.left = `${(point.x * .5 + .5) * 100}%`;
        label.style.top = `${(-point.y * .5 + .5) * 100}%`;
        label.style.opacity = Math.max(0, number.life / number.maxLife);
        label.textContent = `${number.critical ? '暴击! ' : ''}${number.source ? `${number.source} ` : ''}-${number.amount}`;
        threeLabels.appendChild(label);
    });
}

// ============ 角色类 ============
class Character {
    constructor(type, x = GAME_WIDTH / 2, y = GAME_HEIGHT / 2) {
        const animalData = ANIMALS[type];
        this.type = type;
        this.name = animalData.name;
        this.emoji = animalData.emoji;
        this.color = animalData.color;

        this.level = 1;
        this.exp = 0;
        this.expToLevel = this.calculateExpToLevel();

        this.attack = animalData.baseAttack;
        this.defense = animalData.baseDefense;
        this.speed = animalData.baseSpeed;
        this.maxHp = animalData.baseHp;
        this.hp = this.maxHp;

        this.x = x;
        this.y = y;
        this.radius = 25;
        this.vx = 0;
        this.vy = 0;
        this.skills = [];
        this.cooldown = 0;
        this.facing = { x: 0, y: -1 };
        this.activeCooldown = 0;
        this.empoweredHits = 0;
        this.empoweredDamage = 0;
        this.shieldHits = 0;
        this.shieldReduction = 0;
        this.regenBonus = 0;
        this.regenProgress = 0;
        this.critChance = 0;
        this.lifesteal = 0;
        this.skillPower = 0;
        this.activeCooldownReduction = 0;
        this.passiveAbility = ABILITIES[type].passive;
        this.activeAbility = ABILITIES[type].active;
        this.applyPassive();
    }

    calculateExpToLevel() {
        return Math.floor(50 * Math.pow(1.15, this.level - 1));
    }

    addExp(amount) {
        // 5V5 是纯团队战，不产生等级、经验或升级选择。
        if (gameState.mode === 'team') return false;
        this.exp += amount;
        return this.tryLevelUp();
    }

    tryLevelUp() {
        if (this.exp < this.expToLevel) return false;

        this.exp -= this.expToLevel;
        this.level++;
        this.expToLevel = this.calculateExpToLevel();
        // 升级时恢复HP
        this.hp = this.maxHp;
        gameState.screen = 'levelup';
        gameState.levelUpShown = false;  // 重置标志
        return true;
    }

    applySkill(skill) {
        const applyBonus = bonus => {
            if (typeof bonus.attack === 'number') this.attack += bonus.attack;
            if (typeof bonus.defense === 'number') this.defense += bonus.defense;
            if (typeof bonus.speed === 'number') this.speed += bonus.speed;
            if (typeof bonus.hp === 'number') { this.maxHp += bonus.hp; this.hp = this.maxHp; gameState.lastUpgradeNotice = `生命上限 +${bonus.hp}，当前 ${this.maxHp} HP`; }
            if (typeof bonus.regen === 'number') this.regenBonus += bonus.regen;
            if (typeof bonus.crit === 'number') this.critChance += bonus.crit;
            if (typeof bonus.lifesteal === 'number') this.lifesteal += bonus.lifesteal;
            if (typeof bonus.skillPower === 'number') this.skillPower += bonus.skillPower;
            if (typeof bonus.cooldown === 'number') this.activeCooldownReduction = Math.min(.7, this.activeCooldownReduction + bonus.cooldown);
        };
        applyBonus(skill.type === 'compound' || skill.type === 'mixed' ? skill.value : { [skill.type]: skill.value });
        this.skills.push(skill);
    }

    applyPassive() {
        const bonus = this.passiveAbility.bonus;
        if (bonus.attack) this.attack += bonus.attack;
        if (bonus.defense) this.defense += bonus.defense;
        if (bonus.speed) this.speed += bonus.speed;
        if (bonus.hp) {
            this.maxHp += bonus.hp;
            this.hp = this.maxHp;
        }
    }

    useActiveSkill() {
        if (gameState.screen !== 'playing' || this.activeCooldown > 0 || this.hp <= 0) return false;

        const active = this.activeAbility;
        if (active.effect === 'heal' || active.effect === 'healShield') {
            this.hp = Math.min(this.maxHp, this.hp + Math.ceil(this.maxHp * active.amount));
        }
        if (active.effect === 'grow') {
            this.maxHp += active.amount;
            this.hp = Math.min(this.maxHp, this.hp + active.amount);
            gameState.lastUpgradeNotice = `成长呼噜：生命上限 +${active.amount}，当前 ${this.maxHp} HP`;
        }
        // 冲撞由实体效果逐帧带着英雄前进，路径上的敌人也会受到伤害。
        if (active.effect === 'empower') {
            // 强化类技能改为实际飞行的攻击实体，不再只是面板上的临时加成。
            this.empoweredHits = 0;
            this.empoweredDamage = 0;
        }
        if (active.effect === 'shield' || active.effect === 'healShield') {
            this.shieldHits = active.hits;
            this.shieldReduction = active.reduction;
        }

        spawnSkillEffect(this, active);
        this.activeCooldown = active.cooldown * (1 - this.activeCooldownReduction) * TARGET_FPS;
        if (gameState.mode === 'tutorial' && gameState.tutorial && gameState.tutorial.step === 3) {
            const enemy = new Enemy('rabbit', this.x + 300, this.y);
            enemy.name = '训练小兔';
            enemy.maxHp = 20; enemy.hp = 20; enemy.attack = 2; enemy.defense = 0;
            gameState.enemies = [enemy];
            setTutorialStep(4);
        }
        return true;
    }

    takeDamage(damage) {
        let actualDamage = Math.max(1, damage - Math.floor(this.defense / 2));
        if (this.shieldHits > 0) {
            actualDamage = Math.max(1, Math.ceil(actualDamage * (1 - this.shieldReduction)));
            this.shieldHits--;
        }
        this.hp -= actualDamage;
        return actualDamage;
    }

    update(frameScale = 1) {
        // 移动
        this.x += this.vx * frameScale;
        this.y += this.vy * frameScale;

        // 边界检测
        this.x = Math.max(this.radius, Math.min(GAME_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(GAME_HEIGHT - this.radius, this.y));
        if (gameState.environment === 'land') {
            // 树和石头使用圆形碰撞：推回圆边并移除朝内的速度，角色会沿边缘滑动。
            for (const obstacle of gameState.obstacles || []) {
                const minimumDistance = this.radius + obstacle.radius;
                let dx = this.x - obstacle.x, dy = this.y - obstacle.y;
                let distance = Math.hypot(dx, dy);
                if (distance >= minimumDistance) continue;
                if (distance < .001) { dx = this.vx || 1; dy = this.vy || 0; distance = Math.hypot(dx, dy) || 1; }
                const normalX = dx / distance, normalY = dy / distance;
                this.x = obstacle.x + normalX * minimumDistance;
                this.y = obstacle.y + normalY * minimumDistance;
                const inwardSpeed = this.vx * normalX + this.vy * normalY;
                if (inwardSpeed < 0) {
                    this.vx -= inwardSpeed * normalX;
                    this.vy -= inwardSpeed * normalY;
                }
            }
        }

        if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - frameScale);
        if (this.attackFlash > 0) this.attackFlash = Math.max(0, this.attackFlash - frameScale);
        if (this.bossSkillCooldown > 0) this.bossSkillCooldown = Math.max(0, this.bossSkillCooldown - frameScale);
        if (this.activeCooldown > 0) this.activeCooldown = Math.max(0, this.activeCooldown - frameScale);
    }

    draw(ctx) {
        if (this === gameState.player) {
            ctx.fillStyle = '#ffb300';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.radius - 34);
            ctx.lineTo(this.x - 10, this.y - this.radius - 48);
            ctx.lineTo(this.x + 10, this.y - this.radius - 48);
            ctx.closePath();
            ctx.fill();
        }
        // 绘制生命值显示
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);

        // 绘制HP条
        const barWidth = 50;
        const barHeight = 5;
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 12, barWidth, barHeight);
        ctx.fillStyle = '#66bb6a';
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 12, barWidth * hpPercent, barHeight);
    }
}

// ============ 敌人AI ============
class Enemy extends Character {
    constructor(type, x, y) {
        super(type, x, y);
        this.targetX = x;
        this.targetY = y;
        this.changeDirectionTimer = Math.random() * 100 + 50;
    }

    update(frameScale = 1) {
        // Boss 会持续锁定玩家；普通敌人才保留随机巡逻行为。
        if (gameState.mode === 'team') {
            // 团队模式的目标由 updateTeamTargets 分配，不能再被随机巡逻覆盖。
        } else if ((this.isBoss || gameState.provokeActive) && gameState.player) {
            this.targetX = gameState.player.x;
            this.targetY = gameState.player.y;
        } else {
            this.changeDirectionTimer -= frameScale;
            if (this.changeDirectionTimer <= 0) {
                this.targetX = Math.random() * GAME_WIDTH;
                this.targetY = Math.random() * GAME_HEIGHT;
                this.changeDirectionTimer = Math.random() * 100 + 50;
            }
        }

        // 向目标移动
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const stopDistance = this.isBoss && gameState.player ? this.radius + gameState.player.radius - 3 : 5;
        if (distance > stopDistance) {
            // Boss 略快于普通敌人，避免玩家只要绕圈就永远不会被追上。
            const speed = this.speed * (this.isBoss ? 0.42 : 0.3);
            this.vx = (dx / distance) * speed;
            this.vy = (dy / distance) * speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        super.update(frameScale);
    }
}

// ============ 经验粒子 ============
class Particle {
    constructor(x, y, type = 'exp', value = null) {
        this.id = nextParticleId++;
        this.x = x;
        this.y = y;
        this.type = type; // 'exp' 或 'heal'
        this.value = value || (type === 'exp' ? 5 : 8);
        
        // 根据价值设置粒子大小（越大价值越高）
        if (type === 'exp') {
            // 经验粒子：5-25经验，半径8-18
            this.radius = 8 + Math.min(10, this.value / 2);
            this.emoji = '⭐';
            this.color = '#FFD700';  // 金色
        } else if (type === 'heal') {
            // 治疗粒子：8-20血，半径8-16
            this.radius = 8 + Math.min(8, this.value / 3);
            this.emoji = '❤️';
            this.color = '#FF1493';  // 深粉色
        }
        
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2; // 向上飘
        this.life = 240; // 4 秒（以 60 FPS 为基准）
        this.maxLife = 240;
        this.pickupDelay = 28; // 先展示掉落动画，再允许拾取
    }

    update(frameScale = 1, player = null) {
        // 只有击杀掉落会自动飞向玩家；宝箱与地图上的物品仍需主动靠近。
        if (this.pickupDelay > 0) {
            this.pickupDelay = Math.max(0, this.pickupDelay - frameScale);
        } else if (this.autoCollect && player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0) {
                // 每一帧重新朝玩家当前位置转向，角色拐弯时粒子也会立刻跟随。
                const speed = Math.min(18, 6 + distance * 0.08);
                const turn = 1 - Math.pow(0.55, frameScale);
                this.vx += ((dx / distance) * speed - this.vx) * turn;
                this.vy += ((dy / distance) * speed - this.vy) * turn;
            }
        }

        if (!this.isAmbient) {
            this.x += this.vx * frameScale;
            this.y += this.vy * frameScale;
            if (!this.autoCollect) this.vy += 0.08 * frameScale; // 普通掉落才受重力影响
        }
        this.life -= frameScale;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife; // 透明度逐渐减弱
        ctx.save();
        ctx.globalAlpha = alpha;

        // 根据生命周期缩放粒子
        const age = this.maxLife - this.life;
        const scale = (0.5 + (this.life / this.maxLife) * 0.5) * (1 + Math.sin(age * 0.25) * 0.08);
        const fontSize = Math.max(20, this.radius * 1.5 * scale);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha * 0.2;
        ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);

        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = this.chestReward ? '#ffffff' : this.color;
        ctx.fillText(this.type === 'exp' ? `${this.chestReward ? '奖励 ' : ''}XP+${this.value}` : `${this.chestReward ? '奖励 ' : ''}HP+${this.value}`, this.x, this.y + this.radius + 10);

        ctx.restore();
    }
}

// 主动技能在场上保留为可见实体：攻击类是飞行投射物，冲刺类是落点冲击，防护/治疗类是跟随英雄的光环。
class SkillEffect {
    constructor(owner, active) {
        this.owner = owner;
        this.x = owner.x;
        this.y = owner.y;
        this.color = owner.color;
        this.name = active.name;
        this.radius = 26;
        this.life = 48;
        this.hitEnemies = new Set();
        this.vx = 0;
        this.vy = 0;
        if (active.effect === 'empower') {
            this.kind = 'projectile'; this.radius = 20; this.life = 150;
            this.vx = owner.facing.x * 12; this.vy = owner.facing.y * 12;
            this.damage = Math.ceil((owner.attack + active.bonus) * (1 + owner.skillPower));
        } else if (active.effect === 'dash') {
            this.kind = 'charge'; this.radius = 42; this.life = Math.ceil(active.distance / 14) + 2;
            this.vx = owner.facing.x * 14; this.vy = owner.facing.y * 14;
            this.damage = Math.ceil(owner.attack * 1.35 * (1 + owner.skillPower));
        } else {
            this.kind = 'aura'; this.radius = active.effect === 'grow' ? 62 : 48; this.life = 75;
            this.damage = 0;
        }
    }

    update(frameScale = 1) {
        if (this.kind === 'projectile') {
            this.x += this.vx * frameScale;
            this.y += this.vy * frameScale;
        } else if (this.kind === 'charge') {
            this.x += this.vx * frameScale; this.y += this.vy * frameScale;
            this.x = Math.max(this.owner.radius, Math.min(GAME_WIDTH - this.owner.radius, this.x));
            this.y = Math.max(this.owner.radius, Math.min(GAME_HEIGHT - this.owner.radius, this.y));
            this.owner.x = this.x; this.owner.y = this.y;
        } else if (this.kind === 'aura') {
            this.x = this.owner.x; this.y = this.owner.y;
        }
        this.life -= frameScale;
    }

    draw(ctx) {
        ctx.save();
        const alpha = Math.max(0, Math.min(1, this.life / 35));
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 4;
        if (this.kind === 'aura') {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText(this.name, this.x, this.y - this.radius - 8);
        }
        ctx.restore();
    }
}

function spawnSkillEffect(owner, active) {
    gameState.skillEffects.push(new SkillEffect(owner, active));
}

function defeatEnemyBySkill(enemy) {
    const player = gameState.player;
    const index = gameState.enemies.indexOf(enemy);
    if (!player || index < 0) return;
    gameState.stats.killCount++;
    gameState.stats.coins += enemy.isBoss ? 80 : 12;
    localStorage.setItem('coins', gameState.stats.coins);
    player.addExp(Math.floor(10 * (1 + enemy.level * 0.5)));
    spawnParticles(enemy.x, enemy.y, 5);
    gameState.enemies.splice(index, 1);
    if (gameState.enemies.length !== 0) return;
    if (gameState.mode === 'tutorial') return completeTutorialBattle();
    if (gameState.mode === 'team') return finishRankedMatch(true);
    if (gameState.mode === 'ranked') {
        if (gameState.world.level >= 50) return finishRankedMatch(true, 4);
        if (enemy.isBoss) { player.hp = player.maxHp; spawnParticles(enemy.x, enemy.y, 10); }
        gameState.world.level++;
        spawnEnemies();
        player.addExp(500);
        return;
    }
    if (enemy.isBoss) {
        player.addExp(50 + gameState.world.level * 10);
        player.hp = player.maxHp;
        spawnParticles(enemy.x, enemy.y, 10);
    }
    gameState.world.level++;
    spawnEnemies();
}

function updateSkillEffects(frameScale = 1) {
    for (let i = gameState.skillEffects.length - 1; i >= 0; i--) {
        const effect = gameState.skillEffects[i];
        effect.update(frameScale);
        if (effect.damage > 0) {
            for (const enemy of gameState.enemies) {
                if (effect.hitEnemies.has(enemy)) continue;
                if (Math.hypot(effect.x - enemy.x, effect.y - enemy.y) < effect.radius + enemy.radius) {
                    const actualDamage = enemy.takeDamage(effect.damage);
                    spawnDamageNumber(enemy, actualDamage, false, '技能');
                    enemy.attackFlash = 8;
                    effect.hitEnemies.add(enemy);
                    if (enemy.hp <= 0) { defeatEnemyBySkill(enemy); return; }
                }
            }
        }
        if (effect.life <= 0 || effect.x < -80 || effect.x > GAME_WIDTH + 80 || effect.y < -80 || effect.y > GAME_HEIGHT + 80) gameState.skillEffects.splice(i, 1);
    }
}

function updateDamageNumbers(frameScale = 1) {
    for (let i = gameState.damageNumbers.length - 1; i >= 0; i--) {
        const number = gameState.damageNumbers[i];
        number.y -= .65 * frameScale;
        number.life -= frameScale;
        if (number.life <= 0) gameState.damageNumbers.splice(i, 1);
    }
}

// ============ 生成经验粒子 ============
function spawnParticles(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
        // 随机生成经验粒子和治疗粒子
        const type = Math.random() > 0.4 ? 'exp' : 'heal';
        let value;
        
        if (type === 'exp') {
            // 经验粒子：5-25经验（不同大小）
            value = 5 + Math.floor(Math.random() * 5) * 5;
        } else {
            // 治疗粒子：8-20血（不同大小）
            value = 8 + Math.floor(Math.random() * 3) * 4;
        }
        
        const particle = new Particle(x, y, type, value);
        particle.autoCollect = true;
        // 掉落会向四周弹开，保证玩家能先看见再收集。
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const distance = 30 + Math.random() * 35;
        particle.x += Math.cos(angle) * distance;
        particle.y += Math.sin(angle) * distance;
        particle.vx = Math.cos(angle) * (2.5 + Math.random() * 2);
        particle.vy = Math.sin(angle) * (2.5 + Math.random() * 2) - 2;
        gameState.particles.push(particle);
    }
}

// ============ 战斗系统 ============
function rollBattleDamage(attacker) {
    let damage = Math.max(3, attacker.attack + Math.floor(Math.random() * 5) - 2);
    if (attacker.empoweredHits > 0) {
        damage += attacker.empoweredDamage;
        attacker.empoweredHits--;
        if (attacker.empoweredHits === 0) attacker.empoweredDamage = 0;
    }
    attacker.lastCritical = Math.random() < attacker.critChance;
    if (attacker.lastCritical) damage *= 2;
    return damage;
}

function attackOnce(attacker, defender) {
    if (attacker.cooldown > 0) return false;
    let damage = rollBattleDamage(attacker);
    const canUseBossSkill = attacker.isBoss && attacker.bossSkillCooldown <= 0;
    if (canUseBossSkill) {
        damage = Math.ceil(damage * 2.25 + 8);
        attacker.bossSkillCooldown = 7 * TARGET_FPS;
        attacker.bossRoar = true;
        attacker.lastActionText = attacker.bossSkillName || '王者猛击';
    } else attacker.bossRoar = false;
    const actualDamage = defender.takeDamage(damage);
    spawnDamageNumber(defender, actualDamage, attacker.lastCritical, canUseBossSkill ? 'BOSS!' : '');
    if (attacker.lifesteal > 0) attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.ceil(damage * attacker.lifesteal));
    attacker.cooldown = Math.max(18, 42 - attacker.speed * 2);
    attacker.attackFlash = canUseBossSkill ? 18 : 10;
    if (attacker === gameState.player || defender === gameState.player) gameState.player.lastCombatTime = gameState.world.time;
    return defender.hp <= 0;
}

function spawnAmbientPickups(count = 32) {
    for (let i = 0; i < count; i++) {
        let x = 40 + Math.random() * (GAME_WIDTH - 80);
        let y = 40 + Math.random() * (GAME_HEIGHT - 80);
        if (Math.hypot(x - gameState.player.x, y - gameState.player.y) < 110) { i--; continue; }
        const type = 'exp';
        const particle = new Particle(x, y, type, 1 + Math.floor(Math.random() * 3));
        particle.vx = 0; particle.vy = 0; particle.pickupDelay = 0; particle.life = 999999; particle.maxLife = 999999; particle.isAmbient = true;
        gameState.particles.push(particle);
    }
}

function spawnChest() {
    let x = 80 + Math.random() * (GAME_WIDTH - 160), y = 80 + Math.random() * (GAME_HEIGHT - 160);
    while (Math.hypot(x - gameState.player.x, y - gameState.player.y) < 220) { x = 80 + Math.random() * (GAME_WIDTH - 160); y = 80 + Math.random() * (GAME_HEIGHT - 160); }
    gameState.chests.push({ x, y, radius: 28, color: '#c77b2b' });
}

function spawnChestRewards(x, y) {
    // 宝箱奖励以掉落物出现，玩家需要看到并收集它们。
    for (let i = 0; i < 14; i++) {
        const type = i < 10 ? 'exp' : 'heal';
        const value = type === 'exp' ? 12 + Math.floor(Math.random() * 4) * 6 : 10 + Math.floor(Math.random() * 3) * 5;
        const particle = new Particle(x, y, type, value);
        const angle = (Math.PI * 2 * i) / 14 + (Math.random() - .5) * .35;
        const distance = 46 + (i % 2) * 7;
        particle.x += Math.cos(angle) * distance;
        particle.y += Math.sin(angle) * distance;
        // 直接摆成一圈，不再向远处飞散。
        particle.vx = 0;
        particle.vy = 0;
        particle.pickupDelay = 16;
        particle.chestReward = true;
        gameState.particles.push(particle);
    }
}

function battle(player, enemy) {
    // 简单的回合制战斗
    let battleLog = [];

    // 判断谁先手
    let playerFirst = player.speed > enemy.speed;

    for (let round = 0; round < 100; round++) {
        if (playerFirst) {
            // 玩家先手
            const playerDamage = rollBattleDamage(player);
            enemy.takeDamage(playerDamage);
            battleLog.push(`${player.name} 造成 ${playerDamage} 伤害`);

            if (enemy.hp <= 0) {
                battleLog.push(`${enemy.name} 被击败!`);
                return { winner: player, loser: enemy, log: battleLog };
            }

            // 敌人反击
            const enemyDamage = rollBattleDamage(enemy);
            player.takeDamage(enemyDamage);
            battleLog.push(`${enemy.name} 造成 ${enemyDamage} 伤害`);

            if (player.hp <= 0) {
                battleLog.push(`${player.name} 被击败!`);
                return { winner: enemy, loser: player, log: battleLog };
            }
        } else {
            // 敌人先手
            const enemyDamage = rollBattleDamage(enemy);
            player.takeDamage(enemyDamage);
            battleLog.push(`${enemy.name} 造成 ${enemyDamage} 伤害`);

            if (player.hp <= 0) {
                battleLog.push(`${player.name} 被击败!`);
                return { winner: enemy, loser: player, log: battleLog };
            }

            // 玩家反击
            const playerDamage = rollBattleDamage(player);
            enemy.takeDamage(playerDamage);
            battleLog.push(`${player.name} 造成 ${playerDamage} 伤害`);

            if (enemy.hp <= 0) {
                battleLog.push(`${enemy.name} 被击败!`);
                return { winner: player, loser: enemy, log: battleLog };
            }
        }
    }

    return { winner: null, loser: null, log: battleLog };
}

// ============ 初始化 ============
function init() {
    initAccount();
    checkUnlocks();
    gameState.screen = 'hall';
    showHall();
    // 首次进入不再弹出大厅说明，而是直接进入一局可操作的新手实战。
    if (!localStorage.getItem('tutorialComplete')) {
        const useMobile = window.confirm('新手教程：你使用手机玩吗？\n确定：手机摇杆\n取消：电脑键盘');
        setControlMode(useMobile ? 'mobile' : 'desktop');
        startTutorialBattle();
    }
}

const TUTORIAL_STEPS = [
    '这是新手实战：按 WASD 或方向键，让小猫先走起来。',
    '跟着箭头吃掉这个经验点：会获得经验并回复 1 点生命。',
    '靠近宝箱打开它。奖励会落在宝箱周围，记得亲自拾取。',
    '点击左上角的主动技能按钮，试试小猫的成长呼噜。',
    '最后靠近小兔子并击败它。碰到敌人会自动攻击；脱战 5 秒会自动回血。升级后可选择普通、稀有、史诗或传奇技能。'
];

function setTutorialStep(step) {
    const tutorial = gameState.tutorial;
    if (!tutorial) return;
    tutorial.step = step;
    const coach = document.getElementById('tutorialCoach');
    const hint = document.getElementById('tutorialHint');
    const arrow = document.getElementById('tutorialArrow');
    let x = 50, y = 49, direction = '⬇';
    if (step === 1) { x = 64; y = 50; }
    if (step === 2) { x = 74; y = 50; }
    if (step === 4) { x = 82; y = 50; }
    coach.style.transform = 'translate(-50%, -100%)';
    if (step === 3) {
        // 技能按钮会随着全屏、窗口宽度和面板布局移动，直接读取它的位置。
        const containerRect = document.getElementById('gameContainer').getBoundingClientRect();
        const skillRect = document.getElementById('activeSkillButton').getBoundingClientRect();
        x = ((skillRect.left + skillRect.width / 2 - containerRect.left) / containerRect.width) * 100;
        y = ((skillRect.top - containerRect.top) / containerRect.height) * 100;
    }
    coach.style.left = `${x}%`; coach.style.top = `${y}%`;
    arrow.textContent = direction;
    hint.textContent = step === 0
        ? (controlMode === 'mobile'
            ? '这是新手实战：拖动左下角的摇杆，让小猫先走起来。'
            : '这是新手实战：按 WASD 或方向键，让小猫先走起来。')
        : TUTORIAL_STEPS[step];
    coach.style.display = 'block';
}

function placeTutorialPlayerSafely(player) {
    const obstacles = gameState.obstacles || [];
    const padding = player.radius + 60;
    const candidates = [{ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }];
    for (let ring = 1; ring <= 4; ring++) {
        const distance = ring * 105;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            candidates.push({
                x: GAME_WIDTH / 2 + Math.cos(angle) * distance,
                y: GAME_HEIGHT / 2 + Math.sin(angle) * distance
            });
        }
    }
    const safeSpot = candidates.find(point =>
        point.x > player.radius + 80 && point.x < GAME_WIDTH - player.radius - 80 &&
        point.y > player.radius + 80 && point.y < GAME_HEIGHT - player.radius - 80 &&
        !obstacles.some(obstacle => Math.hypot(point.x - obstacle.x, point.y - obstacle.y) < obstacle.radius + padding)
    );
    if (safeSpot) {
        player.x = safeSpot.x;
        player.y = safeSpot.y;
    }
}

function startTutorialBattle() {
    document.getElementById('hallModal').classList.add('hidden');
    document.getElementById('tutorialModal').classList.add('hidden');
    document.getElementById('tutorialExitButton').style.display = 'block';
    gameState.mode = 'tutorial';
    gameState.tutorial = { step: 0, moved: false, completed: false };
    startGame('cat');
    setTutorialStep(0);
}

function spawnTutorialBattle() {
    const player = gameState.player;
    gameState.enemies = [];
    gameState.allies = [];
    gameState.particles = [];
    gameState.skillEffects = [];
    gameState.chests = [];
    const exp = new Particle(player.x + 145, player.y, 'exp', 8);
    exp.vx = 0; exp.vy = 0; exp.pickupDelay = 0; exp.life = 999999; exp.maxLife = 999999; exp.isAmbient = true;
    gameState.particles.push(exp);
    gameState.chests.push({ x: player.x + 250, y: player.y, radius: 28, color: '#c77b2b', tutorialChest: true });
}

function finishTutorial() {
    localStorage.setItem('tutorialComplete', 'true');
    document.getElementById('tutorialModal').classList.add('hidden');
    if (gameState.mode === 'tutorial') exitTutorialBattle();
}

function returnToHallWithIntro() {
    if (!gameState.tutorial || !gameState.tutorial.completed) return finishTutorial();
    exitTutorialBattle();
    gameState.hallIntroShowing = true;
    document.getElementById('tutorialText').textContent = '欢迎来到大厅！上方可以查看账号等级、金币和信誉分；中间可选择爬塔、排位爬塔或 5v5 团队模式；下方的英雄、背包、商城和邮件可用于管理账号与领取奖励。';
    document.getElementById('tutorialNext').textContent = '进入大厅';
    document.getElementById('tutorialSkip').style.display = 'none';
    document.getElementById('tutorialModal').classList.remove('hidden');
}

function closeHallIntro() {
    gameState.hallIntroShowing = false;
    document.getElementById('tutorialModal').classList.add('hidden');
    document.getElementById('tutorialSkip').style.display = '';
}

function exitTutorialBattle() {
    gameState.tutorial = null;
    gameState.player = null;
    gameState.enemies = [];
    gameState.allies = [];
    gameState.particles = [];
    gameState.skillEffects = [];
    gameState.chests = [];
    gameState.screen = 'hall';
    document.getElementById('tutorialCoach').style.display = 'none';
    document.getElementById('tutorialExitButton').style.display = 'none';
    showHall();
}

function completeTutorialBattle() {
    localStorage.setItem('tutorialComplete', 'true');
    document.getElementById('tutorialCoach').style.display = 'none';
    document.getElementById('tutorialExitButton').style.display = 'none';
    gameState.tutorial.completed = true;
    document.getElementById('tutorialText').textContent = '新手实战完成！你已经学会移动、拾取、开宝箱、使用技能和战斗。';
    document.getElementById('tutorialNext').textContent = '返回大厅并了解大厅';
    document.getElementById('tutorialSkip').style.display = '';
    document.getElementById('tutorialModal').classList.remove('hidden');
}

function getMails() { return JSON.parse(localStorage.getItem('mails') || '[]'); }
function saveMails(mails) { localStorage.setItem('mails', JSON.stringify(mails)); }
function sendRewardMail(title, content, rewards = {}) {
    const mails = getMails();
    mails.unshift({ title, content, rewards, system: true, read: false, claimed: false });
    saveMails(mails);
}
function claimMail(index) {
    const mails = getMails();
    const mail = mails[index];
    if (!mail || mail.claimed) return;
    const rewards = mail.rewards || {};
    if (rewards.coins) {
        gameState.stats.coins += rewards.coins;
        localStorage.setItem('coins', gameState.stats.coins);
    }
    if (rewards.renameCard) gameState.account.inventory.renameCard = (gameState.account.inventory.renameCard || 0) + rewards.renameCard;
    if (rewards.hero && ANIMALS[rewards.hero]) {
        ANIMALS[rewards.hero].unlocked = true;
        saveUnlockedHeroes();
    }
    mail.claimed = true; mail.read = true;
    saveMails(mails); saveAccount();
    showRewardToast(rewards);
    openAccountPanel('mail');
}

function rewardText(rewards) {
    const items=[];
    if (rewards.coins) items.push(`🪙 金币 ×${rewards.coins}`);
    if (rewards.renameCard) items.push(`🎫 改名卡 ×${rewards.renameCard}`);
    if (rewards.hero && ANIMALS[rewards.hero]) items.push(`${ANIMALS[rewards.hero].emoji} ${ANIMALS[rewards.hero].name}`);
    return items.length ? items.join('\n') : '没有可领取的附件';
}
function showRewardToast(rewards) { window.alert(`领取成功！\n${rewardText(rewards)}`); }
function claimAllMails() {
    const mails=getMails(); const rewards={coins:0,renameCard:0}; const heroes=[];
    let count=0;
    mails.forEach(mail => {
        if (mail.claimed) return;
        const r=mail.rewards||{}; count++;
        if (r.coins) { gameState.stats.coins+=r.coins; rewards.coins+=r.coins; }
        if (r.renameCard) { gameState.account.inventory.renameCard=(gameState.account.inventory.renameCard||0)+r.renameCard; rewards.renameCard+=r.renameCard; }
        if (r.hero && ANIMALS[r.hero]) { ANIMALS[r.hero].unlocked=true; heroes.push(`${ANIMALS[r.hero].emoji} ${ANIMALS[r.hero].name}`); }
        mail.claimed=true; mail.read=true;
    });
    if (!count) return window.alert('没有可领取的邮件附件。');
    localStorage.setItem('coins', gameState.stats.coins); saveUnlockedHeroes(); saveMails(mails); saveAccount();
    window.alert(`一键领取成功！\n${rewardText(rewards)}${heroes.length ? `\n${heroes.join('\n')}` : ''}`);
    openAccountPanel('mail');
}

function showCoinHelp() { window.alert('🪙 金币用途：\n1. 在商城购买可购买的英雄。\n2. 账号升级奖励、战斗奖励和签到奖励都会获得金币。'); }

function useRenameCard() {
    if ((gameState.account.inventory.renameCard || 0) < 1) return window.alert('你还没有改名卡。');
    if (!window.confirm('确定要使用一张改名卡吗？')) return;
    const banned = /傻[逼比]|妈的|操|fuck|shit|外挂|作弊/i;
    const nextName = window.prompt('请输入新的名字（2 到 12 个字符）：', gameState.account.name);
    if (nextName === null) return;
    const name = nextName.trim();
    if (name.length < 2 || banned.test(name)) return window.alert('名字不符合规范，请换一个名字。');
    gameState.account.name = name.slice(0, 12);
    gameState.account.inventory.renameCard--;
    saveAccount();
    window.alert('改名成功！');
    openAccountPanel('bag');
}

function initAccount() {
    if (!gameState.account.name) {
        const banned = /傻[逼比]|妈的|操|fuck|shit|外挂|作弊/i;
        let name = window.prompt('欢迎来到吞噬大冒险！请给自己取一个名字：', '冒险家') || '冒险家';
        if (banned.test(name) || name.trim().length < 2) name = '冒险家';
        gameState.account.name = name.trim().slice(0, 12);
        gameState.account.inventory.renameCard = gameState.account.inventory.renameCard || 0;
        sendRewardMail('欢迎加入！', '欢迎礼包：一张改名卡。请前往邮件手动领取。', { renameCard: 1 });
    }
    saveAccount();
}
function saveAccount() {
    const a = gameState.account;
    localStorage.setItem('playerName', a.name); localStorage.setItem('accountLevel', a.level); localStorage.setItem('accountExp', a.exp); localStorage.setItem('reputation', a.reputation); localStorage.setItem('inventory', JSON.stringify(a.inventory));
}
function accountExp(amount) {
    const a=gameState.account; a.exp+=amount;
    const need=a.level*100;
    if(a.exp>=need){a.exp-=need;a.level++; sendRewardMail('账号升级奖励',`恭喜升到 ${a.level} 级，附件含 ${a.level*50} 金币，请手动领取。`,{coins:a.level*50});}
    saveAccount();
}

function showHall() {
    const unlocked = Object.values(ANIMALS).filter(animal => animal.unlocked).length;
    document.getElementById('hallRank').textContent = `当前段位：${rankLabel()}`;
    document.getElementById('hallCoins').textContent = `🪙 ${gameState.stats.coins} 金币`;
    document.getElementById('accountName').textContent = `👤 ${gameState.account.name}`;
    document.getElementById('accountLevel').textContent = `Lv.${gameState.account.level} · ${gameState.account.exp}/${gameState.account.level * 100} 账号经验`;
    // 信誉分系统已移除，账号只保留等级与金币进度。
    document.getElementById('hallHeroes').textContent = `英雄图鉴：${unlocked}/${Object.keys(ANIMALS).length} 已解锁（进入模式后可购买英雄）`;
    const signedToday = localStorage.getItem('signDate') === new Date().toDateString();
    const signDay = Math.min(7, parseInt(localStorage.getItem('signDay')) || 0);
    const todayDay = signDay >= 7 ? 7 : (signedToday ? signDay : signDay + 1);
    document.getElementById('signProgress').textContent = signDay >= 7 ? '新手七日签到已完成' : `今天是新手签到第 ${todayDay} 天（进度 ${signDay}/7）`;
    document.getElementById('signButton').disabled = signedToday || signDay >= 7;
    document.getElementById('signButton').textContent = signDay >= 7 ? '新手签到已完成' : (signedToday ? '今日已签到' : `签到第 ${todayDay} 天`);
    document.getElementById('deviceModeText').textContent = `当前：${controlMode === 'mobile' ? '手机摇杆' : '电脑键盘'}`;
    document.getElementById('desktopModeButton').classList.toggle('selected', controlMode === 'desktop');
    document.getElementById('mobileModeButton').classList.toggle('selected', controlMode === 'mobile');
    updateControlLayout();
    document.getElementById('hallModal').classList.remove('hidden');
}

function openAccountPanel(kind) {
    const title = document.getElementById('subPageTitle');
    const content = document.getElementById('subPageContent');
    const cards = (items) => `<div class="animals-grid">${items}</div>`;
    if (kind === 'hero') {
        title.textContent = '🦸 英雄图鉴';
        content.innerHTML = cards(heroesByPower().map(([key, h]) => `<div class="animal-card" style="opacity:${h.unlocked ? 1 : .55}"><div class="animal-emoji">${heroIconMarkup(key, h)}</div><div>${heroRarityMarkup(h)}</div><div class="animal-name">${h.name}</div><div class="animal-stats">战力 ${calculateHeroPower(h)}<br>${h.unlocked ? '已解锁' : h.signOnly ? '签到专属' : `售价 ${h.price} 金币`}</div></div>`).join(''));
    } else if (kind === 'bag') {
        title.textContent = '🎒 背包';
        content.innerHTML = cards(`<div class="animal-card"><div class="animal-emoji">🪙</div><div class="animal-name">金币</div><div class="animal-stats">${gameState.stats.coins}</div></div><div class="animal-card"><div class="animal-emoji">🪪</div><div class="animal-name">改名卡</div><div class="animal-stats">数量 ×${gameState.account.inventory.renameCard || 0}</div><button class="btn btn-success" type="button" ${gameState.account.inventory.renameCard ? '' : 'disabled'} onclick="useRenameCard()">使用改名卡</button></div>`);
        const coinCard = content.querySelector('.animal-card');
        if (coinCard) { coinCard.style.cursor = 'pointer'; coinCard.title = '点击查看金币用途'; coinCard.onclick = showCoinHelp; }
    } else if (kind === 'shop') {
        title.textContent = '🛒 商城';
        content.innerHTML = cards(heroesByPower()
            .filter(([, h]) => !h.unlocked && !h.signOnly)
            .map(([key,h]) => `<button class="animal-card" type="button" onclick="confirmPurchase('${key}')"><div class="animal-emoji">${heroIconMarkup(key, h)}</div><div>${heroRarityMarkup(h)}</div><div class="animal-name">${h.name}</div><div class="animal-stats">战力 ${calculateHeroPower(h)}<br>🪙 ${h.price} 金币</div></button>`).join('') || '<div class="tip">当前可购买英雄已全部拥有。</div>');
    } else {
        title.textContent = '✉️ 邮件';
        const mails = getMails();
        content.innerHTML = mails.length ? mails.map((m, index) => `<div class="skill-card"><div class="skill-name">${m.system ? '系统邮件' : '好友邮件'} · ${m.title}</div><div class="skill-desc">${m.content}</div><button class="btn ${m.claimed ? '' : 'btn-success'}" type="button" ${m.claimed ? 'disabled' : ''} onclick="claimMail(${index})">${m.claimed ? '已领取' : '领取附件'}</button></div>`).join('') : '<div class="tip">暂无邮件。好友邮件需要联机服务支持。</div>';
    }
    document.getElementById('hallModal').classList.add('hidden');
    document.getElementById('subPageModal').classList.remove('hidden');
}

function claimDailySignIn() {
    const today = new Date().toDateString();
    if (localStorage.getItem('signDate') === today || (parseInt(localStorage.getItem('signDay')) || 0) >= 7) return;
    const day = Math.min(7, (parseInt(localStorage.getItem('signDay')) || 0) + 1);
    localStorage.setItem('signDate', today);
    localStorage.setItem('signDay', day);
    if (day === 2) sendRewardMail('新手七日签到 · 第 2 天', '小狐狸已送达，请在邮件中领取。', { hero: 'fox' });
    else if (day === 7) sendRewardMail('新手七日签到 · 第 7 天', '火凤凰已送达，请在邮件中领取。', { hero: 'phoenix' });
    else sendRewardMail(`新手七日签到 · 第 ${day} 天`, `签到奖励：${day * 30} 金币，请在邮件中领取。`, { coins: day * 30 });
    showHall();
}

function buyHero(key) {
    const hero = ANIMALS[key];
    if (hero.unlocked || gameState.stats.coins < hero.price) return false;
    gameState.stats.coins -= hero.price;
    localStorage.setItem('coins', gameState.stats.coins);
    hero.unlocked = true;
    saveUnlockedHeroes();
    if (gameState.screen === 'select') showAnimalSelection();
    return true;
}

function confirmPurchase(key) {
    const hero = ANIMALS[key];
    if (!hero || hero.unlocked || hero.signOnly) return;
    if (!window.confirm(`确定要购买 ${hero.name} 吗？\n售价：${hero.price} 金币`)) return;
    if (gameState.stats.coins < hero.price) return window.alert('您的金币不足！');
    buyHero(key);
    window.alert('购买成功！');
    openAccountPanel('shop');
}

function chooseMode(mode) {
    if (['ranked','tower'].includes(mode) && getSavedRankedRun(mode)) {
        pendingSaveMode = mode;
        document.getElementById('saveChoiceModal').classList.remove('hidden');
        return;
    }
    gameState.mode = mode;
    document.getElementById('hallModal').classList.add('hidden');
    document.getElementById('selectTitle').textContent = mode === 'ranked' ? `⚔️ 排位赛 · ${rankLabel()}` : mode === 'team' ? '👥 5v5 团队模式：选择英雄' : '🗼 爬塔模式：选择英雄';
    gameState.screen = 'select';
    showAnimalSelection();
}

function cancelAnimalSelection() {
    document.getElementById('selectModal').classList.add('hidden');
    gameState.screen = 'hall';
    showHall();
}

function showAnimalSelection() {
    const grid = document.getElementById('animalsGrid');
    grid.innerHTML = '';

    heroesByPower().forEach(([key, animal]) => {
        const card = document.createElement('div');
        card.className = 'animal-card';
        const abilities = ABILITIES[key];
        
        let lockedHint = '';
        if (animal.unlocked === false) {
            lockedHint = animal.signOnly
                ? `📅 签到专属：第 ${key === 'fox' ? 2 : 7} 天领取`
                : `🪙 ${animal.price} 金币购买<br><small>当前金币: ${gameState.stats.coins}</small>`;
        }

        card.innerHTML = `
            <div class="animal-emoji">${heroIconMarkup(key, animal)}</div>
            <div>${heroRarityMarkup(animal)}</div>
            <div class="animal-name">${animal.name}</div>
            <div class="animal-stats">
                ⚔️ ${animal.baseAttack}<br>
                🛡️ ${animal.baseDefense}<br>
                ⚡ ${animal.baseSpeed}<br>
                ❤️ ${animal.baseHp}<br>
                ⚔️ 战力 ${calculateHeroPower(animal)}
            </div>
            <div style="font-size: 10px; color: #555; line-height: 1.5; margin-top: 8px;">
                被动·${abilities.passive.name}：${abilities.passive.desc}<br>
                主动·${abilities.active.name}：${abilities.active.desc}
            </div>
            ${lockedHint ? `<div style="font-size: 11px; color: #999; margin-top: 8px;">${lockedHint}</div>` : ''}
        `;
        
        if (animal.unlocked === false) {
            card.style.opacity = '0.5';
            card.style.cursor = animal.signOnly ? 'not-allowed' : (gameState.stats.coins >= animal.price ? 'pointer' : 'not-allowed');
            if (!animal.signOnly) card.onclick = () => buyHero(key);
        } else {
            card.onclick = () => startGame(key);
        }
        
        grid.appendChild(card);
    });

    document.getElementById('selectModal').classList.remove('hidden');
}

function startGame(animalType, savedRun = null) {
    document.getElementById('selectModal').classList.add('hidden');
    enterGameFullscreen();
    gameState.screen = 'playing';
    gameState.levelUpShown = false;  // 重置升级标志
    gameState.player = new Character(animalType);
    gameState.enemies = [];
    gameState.particles = [];
    gameState.skillEffects = [];
    gameState.chests = [];
    gameState.damageNumbers = [];
    gameState.provokeActive = false;
    gameState.stats.killCount = 0;
    gameState.skillRerolls = 0;
    gameState.world.level = 1;
    gameState.world.time = 0;
    gameState.environment = environmentFor(animalType);
    applySceneEnvironment();
    if (gameState.mode === 'tutorial' && gameState.environment === 'land') placeTutorialPlayerSafely(gameState.player);
    if (savedRun && ['ranked','tower'].includes(gameState.mode)) {
        const savedPlayer = savedRun.player;
        const fields = ['x','y','level','exp','expToLevel','attack','defense','speed','maxHp','hp','skills','regenBonus','critChance','lifesteal','skillPower','activeCooldownReduction','activeCooldown','empoweredHits','empoweredDamage','shieldHits','shieldReduction'];
        fields.forEach(field => { if (savedPlayer[field] !== undefined) gameState.player[field] = savedPlayer[field]; });
        gameState.world.level = Math.max(1, savedRun.level || 1);
        gameState.world.time = Math.max(0, savedRun.time || 0);
        gameState.stats.killCount = Math.max(0, savedRun.killCount || 0);
        gameState.skillRerolls = Math.max(0, savedRun.skillRerolls || 0);
        gameState.provokeActive = !!savedRun.provokeActive;
    } else if (['ranked','tower'].includes(gameState.mode)) {
        clearRankedRun();
    }
    lastFrameTime = null;
    updateControlLayout();

    if (gameState.mode === 'tutorial') spawnTutorialBattle();
    else if (gameState.mode === 'team') spawnTeamBattle();
    else if (savedRun && ['ranked','tower'].includes(gameState.mode) && Array.isArray(savedRun.enemies)) {
        gameState.enemies = restoreSavedEnemies(savedRun.enemies);
        spawnAmbientPickups();
        if (savedRun.chestAvailable) spawnChest();
    } else {
        spawnEnemies();
        spawnAmbientPickups();
        if (gameState.world.level === 1) spawnChest();
    }
    saveRankedRun();
    // 首帧必须由浏览器提供时间戳，避免直接调用时产生无效坐标。
    requestAnimationFrame(gameLoop);
}

function spawnEnemies() {
    gameState.enemies = [];
    gameState.allies = [];
    const isBossFloor = (gameState.mode === 'tower' || gameState.mode === 'ranked') && gameState.world.level % 5 === 0;
    const enemyCount = isBossFloor ? 1 : Math.min(3 + gameState.world.level, 10);

    for (let i = 0; i < enemyCount; i++) {
        // 敌人可以是任何角色，不受解锁限制
        const bronzePool = ['cat', 'rabbit', 'fox', 'bear'];
        const midPool = [...bronzePool, 'tiger', 'eagle', 'wolf', 'deer', 'panda', 'monkey'];
        const environmentPool = gameState.environment === 'ocean' ? OCEAN_TYPES : gameState.environment === 'sky' ? SKY_TYPES : null;
        const enemyPool = gameState.mode === 'ranked' && environmentPool
            ? environmentPool
            : gameState.mode === 'ranked'
            ? (gameState.world.level >= 25 ? Object.keys(ANIMALS) : gameState.world.level >= 10 ? midPool : gameState.rank.tier === 0 ? bronzePool : gameState.rank.tier <= 2 ? midPool : Object.keys(ANIMALS))
            : Object.keys(ANIMALS);
        let animalType = enemyPool[Math.floor(Math.random() * enemyPool.length)];

        let x = Math.random() * GAME_WIDTH;
        let y = Math.random() * GAME_HEIGHT;

        // 确保不与玩家重叠
        while (Math.hypot(x - gameState.player.x, y - gameState.player.y) < 100) {
            x = Math.random() * GAME_WIDTH;
            y = Math.random() * GAME_HEIGHT;
        }

        const enemy = new Enemy(animalType, x, y);
        enemy.level = gameState.world.level;
        const rankPressure = gameState.mode === 'ranked' ? Math.max(0, gameState.world.level - 5) * 0.09 : 0;
        const scale = 1 + (gameState.world.level - 1) * (gameState.mode === 'ranked' ? 0.12 : 0.08) + rankPressure;
        enemy.attack = Math.floor(enemy.attack * scale);
        enemy.defense = Math.floor(enemy.defense * scale);
        enemy.maxHp = Math.floor(enemy.maxHp * scale);
        enemy.hp = enemy.maxHp;
        if (isBossFloor) {
            enemy.isBoss = true;
            enemy.name = `第${gameState.world.level}层 Boss·${enemy.name}`;
            enemy.emoji = '👑';
            enemy.radius = 36;
            enemy.bossSkillCooldown = 2 * TARGET_FPS;
            enemy.bossSkillName = animalType === 'bear' ? '震地咆哮' : animalType === 'lion' ? '狮王怒吼' : '王者猛击';
            enemy.attack = Math.floor(enemy.attack * 1.5);
            enemy.maxHp = Math.floor(enemy.maxHp * 3);
            enemy.hp = enemy.maxHp;
        }
        gameState.enemies.push(enemy);
    }
}

// ============ 检测碰撞 ============
function checkCollisions() {
    const player = gameState.player;

    for (let i = gameState.chests.length - 1; i >= 0; i--) {
        const chest = gameState.chests[i];
        if (Math.hypot(chest.x - player.x, chest.y - player.y) < player.radius + chest.radius) {
            spawnChestRewards(chest.x, chest.y);
            gameState.chests.splice(i, 1);
            if (gameState.mode === 'tutorial' && chest.tutorialChest) setTutorialStep(3);
        }
    }

    // 5V5 中阵亡玩家进入观战，不能继续攻击、吸血或被动复活。
    if (gameState.mode === 'team' && player.hp <= 0) return;

    // 检测玩家与敌人的碰撞（战斗）
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);

        if (distance < player.radius + enemy.radius) {
            const enemyDefeated = attackOnce(player, enemy);
            if (!enemyDefeated && enemy.cooldown <= 0) attackOnce(enemy, player);

            if (enemyDefeated) {
                // 获胜
                gameState.stats.killCount++;
                gameState.stats.coins += enemy.isBoss ? 80 : 12;
                localStorage.setItem('coins', gameState.stats.coins);
                const expReward = Math.floor(10 * (1 + enemy.level * 0.5));
                player.addExp(expReward);
                
                // 生成经验粒子
                spawnParticles(enemy.x, enemy.y, 5);
                
                gameState.enemies.splice(i, 1);

                if (gameState.enemies.length === 0) {
                    if (gameState.mode === 'tutorial') {
                        completeTutorialBattle();
                        return;
                    }
                    if (gameState.mode === 'team') {
                        finishRankedMatch(true);
                        return;
                    }
                    if (gameState.mode === 'ranked') {
                        // 排位爬塔：清层后必定升级一次，再进入下一层。
                        if (gameState.world.level >= 50) {
                            finishRankedMatch(true, 4);
                            return;
                        }
                        if (enemy.isBoss) { player.hp = player.maxHp; spawnParticles(enemy.x, enemy.y, 10); }
                        gameState.world.level++;
                        spawnEnemies();
                        player.addExp(500);
                        return;
                    }
                    if (enemy.isBoss) {
                        player.addExp(50 + gameState.world.level * 10);
                        player.hp = player.maxHp;
                        spawnParticles(enemy.x, enemy.y, 10);
                    }
                    gameState.world.level++;
                    spawnEnemies();
                }

                // 升级会暂停游戏，不能在同一帧继续结算其他碰撞或拾取。
                if (gameState.screen !== 'playing') return;
            } else if (player.hp <= 0 && gameState.mode !== 'team') {
                // 玩家失败
                endGame();
                return;
            }
        }
    }

    // 检测玩家与粒子的碰撞
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        if (particle.pickupDelay > 0) continue;
        const distance = Math.hypot(particle.x - player.x, particle.y - player.y);

        if (distance < player.radius + particle.radius) {
            if (particle.type === 'exp') {
                // 吃到经验粒子（根据粒子大小获得不同经验）
                player.addExp(particle.value);
                if (particle.isAmbient) player.hp = Math.min(player.maxHp, player.hp + 1);
            } else if (particle.type === 'heal') {
                // 吃到治疗粒子，回血（根据粒子大小回不同血量）
                player.hp = Math.min(player.maxHp, player.hp + particle.value);
            }
            gameState.particles.splice(i, 1);
            if (gameState.mode === 'tutorial' && gameState.tutorial && gameState.tutorial.step === 1) setTutorialStep(2);

            // 若该经验粒子触发升级，保留其余粒子，等玩家选完技能后再继续拾取。
            if (gameState.screen !== 'playing') return;
        }
    }
}

function finishRankedMatch(won, rankRewardOverride = null) {
    gameState.screen = 'gameover';
    exitGameFullscreen();
    if (gameState.mode === 'ranked') clearRankedRun();
    if (gameState.mode === 'ranked' && won) { gameState.stats.rankWins++; localStorage.setItem('rankWins', gameState.stats.rankWins); }
    accountExp(won ? 45 : 20);
    let rankReward = 0;
    if (gameState.mode === 'ranked') {
        const floor = gameState.world.level;
        // 排位爬塔：第 6/10/30 层分别 +1/+2/+3，50 层通关 +4；第 6 层前失败才扣星。
        if (rankRewardOverride !== null) rankReward = rankRewardOverride;
        else if (floor >= 30) rankReward = 3 + Math.floor((floor - 30) / 20);
        else if (floor >= 10) rankReward = 2;
        else if (floor >= 6) rankReward = 1;
        else rankReward = -1;
        const times = Math.abs(rankReward);
        for (let i = 0; i < times; i++) changeRankStars(rankReward > 0 ? 1 : -1);
    }
    document.getElementById('gameOverTitle').textContent = gameState.mode === 'team' ? (won ? '🏆 团队胜利！' : '💥 团队落败') : (rankRewardOverride !== null ? '👑 排位爬塔登顶！' : won ? '🏅 排位胜利！' : '💥 排位落败');
    document.getElementById('characterInfo').innerHTML = `本局使用：<strong>${gameState.player.name} ${gameState.player.emoji}</strong><br>击败敌人：<strong>${gameState.stats.killCount}</strong>`;
    document.getElementById('finalScore').textContent = gameState.mode === 'ranked'
        ? `${rankReward > 0 ? '+' : ''}${rankReward} 星（第 ${gameState.world.level} 层）`
        : '团队模式不影响段位星数';
    document.getElementById('rankInfo').innerHTML = gameState.mode === 'team'
        ? '本局为娱乐团队战，段位保持不变。'
        : `当前段位：<strong>${rankLabel()}</strong>`;
    document.getElementById('restartButton').textContent = '🏠 返回大厅';
    document.getElementById('gameOverModal').classList.remove('hidden');
}

function spawnTeamBattle() {
    const types = Object.keys(ANIMALS);
    for (let i = 0; i < 4; i++) {
        const ally = new Enemy(types[Math.floor(Math.random() * types.length)], 360 + i * 55, 430 + (i % 2) * 55);
        ally.name = `队友·${ally.name}`; ally.team = 'blue'; ally.color = '#4ca8ff';
        gameState.allies.push(ally);
    }
    for (let i = 0; i < 5; i++) {
        const foe = new Enemy(types[Math.floor(Math.random() * types.length)], 580 + i * 55, 220 + (i % 2) * 65);
        foe.name = `敌方·${foe.name}`; foe.team = 'red'; foe.color = '#ef5350';
        gameState.enemies.push(foe);
    }
}

function checkTeamBattles() {
    if (gameState.mode !== 'team') return;
    // 每帧只结算一组 AI 对战，双方同时倒下时也不会读取已经移除的角色。
    let battlePair = null;
    for (const ally of gameState.allies) {
        const enemy = gameState.enemies.find(foe => Math.hypot(ally.x - foe.x, ally.y - foe.y) < 55);
        if (enemy) { battlePair = { ally, enemy }; break; }
    }
    if (battlePair) {
        const { ally, enemy } = battlePair;
        enemy.takeDamage(Math.max(2, ally.attack));
        ally.takeDamage(Math.max(2, enemy.attack));
        if (enemy.hp <= 0) gameState.enemies = gameState.enemies.filter(foe => foe !== enemy);
        if (ally.hp <= 0) gameState.allies = gameState.allies.filter(friend => friend !== ally);
    }
    if (gameState.enemies.length === 0) finishRankedMatch(true);
    else if (gameState.allies.length === 0 && gameState.player.hp <= 0) finishRankedMatch(false);
}

function checkRankedAIBattles() {
    // 新排位为爬塔挑战，不启用 AI 互相淘汰。
    return;
    // 排位是乱斗：AI 英雄彼此相遇也会自动战斗，玩家不必逐个清场。
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
            const a = gameState.enemies[i], b = gameState.enemies[j];
            if (Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius) {
                const result = battle(a, b);
                const loserIndex = result.loser === a ? i : j;
                gameState.enemies.splice(loserIndex, 1);
                if (gameState.enemies.length === 0) finishRankedMatch(true);
                return; // 每帧只结算一场，避免瞬间清空战场。
            }
        }
    }
}

function updateTeamTargets() {
    if (gameState.mode !== 'team') return;
    const closest = (unit, targets) => targets.reduce((best, target) => !best || Math.hypot(unit.x-target.x, unit.y-target.y) < Math.hypot(unit.x-best.x, unit.y-best.y) ? target : best, null);
    gameState.allies.forEach(ally => { const target = closest(ally, gameState.enemies); if (target) { ally.targetX = target.x; ally.targetY = target.y; } });
    gameState.enemies.forEach(enemy => { const targets = [...(gameState.player.hp > 0 ? [gameState.player] : []), ...gameState.allies]; const target = closest(enemy, targets); if (target) { enemy.targetX = target.x; enemy.targetY = target.y; } });
}

// Boss 不必等到与玩家重叠才会施放技能；进入威胁范围后会主动使用专属攻击。
function updateBossSkills() {
    const player = gameState.player;
    if (!player || player.hp <= 0) return;
    for (const boss of gameState.enemies) {
        if (!boss.isBoss || boss.bossSkillCooldown > 0) continue;
        const distance = Math.hypot(boss.x - player.x, boss.y - player.y);
        if (distance > 230) continue;
        const damage = Math.ceil(boss.attack * 2.25 + 8);
        const actualDamage = player.takeDamage(damage);
        boss.bossSkillCooldown = 7 * TARGET_FPS;
        boss.bossRoar = true;
        boss.lastActionText = boss.bossSkillName || '王者猛击';
        boss.attackFlash = 18;
        player.lastCombatTime = gameState.world.time;
        spawnDamageNumber(player, actualDamage, false, 'BOSS!');
    }
}

function endGame() {
    exitGameFullscreen();
    if (gameState.mode === 'tower') clearRankedRun('tower');
    if (gameState.mode === 'ranked') {
        finishRankedMatch(false);
        return;
    }
    gameState.screen = 'gameover';
    accountExp(15 + gameState.stats.killCount * 2);
    const score = gameState.stats.killCount;
    const highScore = Math.max(parseInt(gameState.stats.highScore) || 0, score);
    localStorage.setItem('highScore', highScore);
    
    // 累加历史总击杀数
    gameState.stats.totalKillsEarned += score;
    localStorage.setItem('totalKillsEarned', gameState.stats.totalKillsEarned);
    
    // 向后兼容：也更新leopardKills和phoenixKills
    gameState.stats.leopardKills = Math.max(gameState.stats.leopardKills, gameState.stats.totalKillsEarned);
    gameState.stats.phoenixKills = Math.max(gameState.stats.phoenixKills, gameState.stats.totalKillsEarned);
    localStorage.setItem('leopardKills', gameState.stats.leopardKills);
    localStorage.setItem('phoenixKills', gameState.stats.phoenixKills);

    document.getElementById('characterInfo').innerHTML = `
        你选择的角色: <strong>${gameState.player.name} ${gameState.player.emoji}</strong><br>
        最终等级: <strong>Lv.${gameState.player.level}</strong>
    `;
    document.getElementById('finalScore').textContent = score + ' 个敌人';
    
    let rankText = highScore > score
        ? `最高分: ${highScore} 个敌人`
        : `🎉 创造新纪录！最高分: ${highScore} 个敌人`;
    
    // 记录解锁前的状态
    const unlockedBefore = {};
    Object.keys(ANIMALS).forEach(key => {
        unlockedBefore[key] = ANIMALS[key].unlocked;
    });
    
    // 检查并更新解锁状态
    checkUnlocks();
    
    // 显示新解锁的角色
    const newlyUnlocked = [];
    Object.keys(ANIMALS).forEach(key => {
        const animal = ANIMALS[key];
        if (!unlockedBefore[key] && animal.unlocked) {
            newlyUnlocked.push(animal.name + ' ' + animal.emoji);
        }
    });
    
    if (newlyUnlocked.length > 0) {
        rankText += '<br>🔓 新解锁角色: ' + newlyUnlocked.join('、') + '!';
    }
    
    document.getElementById('rankInfo').innerHTML = rankText;
    document.getElementById('gameOverTitle').textContent = '💀 爬塔结束';
    document.getElementById('restartButton').textContent = '🏠 返回大厅';

    document.getElementById('gameOverModal').classList.remove('hidden');
}

// ============ 显示升级界面 ============
function showLevelUpSkills() {
    // 防止重复生成技能卡片
    if (gameState.levelUpShown) return;
    exitGameFullscreen();
    gameState.levelUpShown = true;
    
    const skillsToShow = [];
    const canUseSkillDamage = ['empower', 'dash'].includes(gameState.player.activeAbility.effect);
    const pickSkill = () => {
        const roll = Math.random() * 100;
        let total = 0;
        let rarity = 'normal';
        for (const key of ['normal', 'rare', 'epic', 'mythic', 'legendary']) {
            total += RARITY_INFO[key].weight;
            if (roll < total) { rarity = key; break; }
        }
        const usable = SKILLS.filter(skill => canUseSkillDamage || (skill.type !== 'skillPower' && !(skill.value && skill.value.skillPower)));
        const pool = usable.filter(skill => skill.rarity === rarity && !skillsToShow.includes(skill));
        const fallback = usable.filter(skill => !skillsToShow.includes(skill));
        const source = pool.length ? pool : fallback;
        return source[Math.floor(Math.random() * source.length)];
    };
    for (let i = 0; i < 3; i++) skillsToShow.push(pickSkill());

    const grid = document.getElementById('skillsGrid');
    grid.innerHTML = '';
    document.getElementById('levelUpInfo').textContent = `升级到 Lv.${gameState.player.level}!`;

    const renderSkills = () => {
    grid.innerHTML = '';
    skillsToShow.forEach((skill, index) => {
        const card = document.createElement('div');
        card.className = `skill-card rarity-${skill.rarity}`;
        card.innerHTML = `
            <div class="skill-name"><span class="rarity-tag">${RARITY_INFO[skill.rarity].label}</span>${skill.name}</div>
            <div class="skill-desc">${skill.desc}${skill.type === 'hp' ? `（当前上限 ${gameState.player.maxHp} → ${gameState.player.maxHp + skill.value}）` : ''}</div>
        `;
        card.onclick = () => {
            gameState.player.applySkill(skill);
            updateUI();
            document.getElementById('levelUpModal').classList.add('hidden');

            // 溢出的经验按等级逐次结算：每一级都能获得一次技能选择。
            if (!gameState.player.tryLevelUp()) {
                gameState.screen = 'playing';
                // 升级选择需要临时退出全屏；玩家点击技能后立刻回到沉浸式全屏战斗。
                enterGameFullscreen();
            }
        };
        grid.appendChild(card);
    });
    if (['tower','ranked'].includes(gameState.mode)) {
        const rerolls = gameState.skillRerolls || 0;
        const cost = rerolls === 0 ? 0 : rerolls * 10;
        const button = document.createElement('button'); button.className = 'btn';
        button.textContent = cost ? `🔄 刷新技能（🪙 ${cost}）` : '🔄 免费刷新技能（本局一次）';
        button.onclick = () => {
            if (cost && gameState.stats.coins < cost) return window.alert('金币不足！');
            if (cost) { gameState.stats.coins -= cost; localStorage.setItem('coins', gameState.stats.coins); }
            gameState.skillRerolls = rerolls + 1;
            skillsToShow.length = 0; for (let i=0;i<3;i++) skillsToShow.push(pickSkill());
            renderSkills();
        };
        grid.appendChild(button);
    }
    };
    renderSkills();

    document.getElementById('levelUpModal').classList.remove('hidden');
}

// ============ 输入处理 ============
const keys = {};
document.getElementById('towerModeButton').addEventListener('click', () => chooseMode('tower'));
document.getElementById('rankedModeButton').addEventListener('click', () => chooseMode('ranked'));
document.getElementById('teamModeButton').addEventListener('click', () => chooseMode('team'));
document.getElementById('resumeSaveButton').addEventListener('click', () => {
    const mode = pendingSaveMode; pendingSaveMode = null;
    document.getElementById('saveChoiceModal').classList.add('hidden');
    if (!resumeRankedRun(mode)) window.alert('存档读取失败，请选择开始新游戏。');
});
document.getElementById('deleteSaveButton').addEventListener('click', () => {
    const mode = pendingSaveMode; pendingSaveMode = null;
    document.getElementById('saveChoiceModal').classList.add('hidden');
    clearRankedRun(mode); chooseMode(mode);
});
document.getElementById('saveChoiceBackButton').addEventListener('click', () => {
    pendingSaveMode = null; document.getElementById('saveChoiceModal').classList.add('hidden'); showHall();
});
document.getElementById('fullscreenButton').addEventListener('click', toggleFullscreen);
document.getElementById('selectBackButton').addEventListener('click', cancelAnimalSelection);
document.getElementById('signButton').addEventListener('click', claimDailySignIn);
document.getElementById('desktopModeButton').addEventListener('click', () => setControlMode('desktop'));
document.getElementById('mobileModeButton').addEventListener('click', () => setControlMode('mobile'));
document.getElementById('subPageBack').addEventListener('click', () => {
    document.getElementById('subPageModal').classList.add('hidden');
    showHall();
});
document.getElementById('tutorialNext').addEventListener('click', () => {
    if (gameState.hallIntroShowing) closeHallIntro();
    else returnToHallWithIntro();
});
document.getElementById('tutorialSkip').addEventListener('click', finishTutorial);
document.getElementById('replayTutorialButton').addEventListener('click', () => {
    localStorage.removeItem('tutorialComplete');
    const useMobile = window.confirm('新手教程：你使用手机玩吗？\n确定：手机摇杆\n取消：电脑键盘');
    setControlMode(useMobile ? 'mobile' : 'desktop');
    startTutorialBattle();
});
document.getElementById('tutorialExitButton').addEventListener('click', finishTutorial);
document.getElementById('activeSkillButton').addEventListener('click', () => {
    if (gameState.player) gameState.player.useActiveSkill();
});
document.getElementById('provokeButton').addEventListener('click', () => {
    if (!['ranked', 'tower'].includes(gameState.mode) || !gameState.player) return;
    gameState.provokeActive = !gameState.provokeActive;
    gameState.enemies.forEach(enemy => {
        if (gameState.provokeActive) {
            enemy.targetX = gameState.player.x;
            enemy.targetY = gameState.player.y;
            enemy.lastActionText = '正在赶来';
            enemy.attackFlash = 10;
        } else if (!enemy.isBoss) {
            enemy.targetX = Math.random() * GAME_WIDTH;
            enemy.targetY = Math.random() * GAME_HEIGHT;
            enemy.changeDirectionTimer = Math.random() * 100 + 50;
            enemy.lastActionText = '已解除锁定';
        }
    });
    saveRankedRun();
    updateUI();
});

const joystick = document.getElementById('mobileJoystick');
const joystickStick = document.getElementById('joystickStick');
function moveJoystick(event) {
    const rect = joystick.getBoundingClientRect();
    const max = 37;
    let dx = event.clientX - (rect.left + rect.width / 2);
    let dy = event.clientY - (rect.top + rect.height / 2);
    const length = Math.hypot(dx, dy) || 1;
    if (length > max) { dx = dx / length * max; dy = dy / length * max; }
    mobileInput.x = dx / max; mobileInput.y = dy / max;
    joystickStick.style.transform = `translate(${dx}px, ${dy}px)`;
}
function resetJoystick() {
    mobileInput.x = 0; mobileInput.y = 0; mobileInput.active = false;
    joystickStick.style.transform = 'translate(0, 0)';
}
joystick.addEventListener('pointerdown', event => { event.preventDefault(); mobileInput.active = true; joystick.setPointerCapture(event.pointerId); moveJoystick(event); });
joystick.addEventListener('pointermove', event => { if (mobileInput.active) moveJoystick(event); });
joystick.addEventListener('pointerup', resetJoystick);
joystick.addEventListener('pointercancel', resetJoystick);

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat && gameState.player) gameState.player.useActiveSkill();
        return;
    }
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// 移动控制
function handleInput() {
    // 速度同时决定移动速度和攻击间隔：每 1 点速度约增加 0.24 像素/帧移动。
    const speed = 2.1 + gameState.player.speed * 0.24;
    gameState.player.vx = 0;
    gameState.player.vy = 0;

    if (controlMode === 'mobile') {
        gameState.player.vx = mobileInput.x * speed;
        gameState.player.vy = mobileInput.y * speed;
    } else {
        if (keys['w'] || keys['arrowup']) gameState.player.vy -= speed;
        if (keys['s'] || keys['arrowdown']) gameState.player.vy += speed;
        if (keys['a'] || keys['arrowleft']) gameState.player.vx -= speed;
        if (keys['d'] || keys['arrowright']) gameState.player.vx += speed;
    }

    const directionLength = Math.hypot(gameState.player.vx, gameState.player.vy);
    if (directionLength > 0) {
        gameState.player.facing = {
            x: gameState.player.vx / directionLength,
            y: gameState.player.vy / directionLength
        };
    }
}

// ============ 渲染 ============
function render() {
    if (render3DReady) {
        render3D();
        return;
    }
    // 清空画布
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 绘制网格背景
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GAME_WIDTH; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i <= GAME_HEIGHT; i += 100) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_WIDTH, i);
        ctx.stroke();
    }

    if (gameState.screen === 'playing') {
        // 绘制敌人
        gameState.enemies.forEach(enemy => {
            enemy.draw(ctx);
        });

        // 绘制粒子
        gameState.particles.forEach(particle => {
            particle.draw(ctx);
        });
        gameState.skillEffects.forEach(effect => effect.draw(ctx));
        gameState.damageNumbers.forEach(number => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, number.life / number.maxLife);
            ctx.font = `900 ${number.critical ? 28 : 20}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillStyle = number.critical ? '#ffe14d' : '#fff';
            ctx.strokeStyle = number.critical ? '#8b2500' : '#111';
            ctx.lineWidth = 4;
            const text = `${number.critical ? '暴击! ' : ''}${number.source ? `${number.source} ` : ''}-${number.amount}`;
            ctx.strokeText(text, number.x, number.y);
            ctx.fillText(text, number.x, number.y);
            ctx.restore();
        });

        // 绘制玩家
        gameState.player.draw(ctx);
    }
}

// ============ 更新UI ============
function updateUI() {
    const player = gameState.player;

    // 玩家信息
    document.getElementById('playerAvatar').textContent = player.emoji;
    document.getElementById('playerName').textContent = player.name;
    const visibleAttack = player.attack + (player.empoweredHits > 0 ? player.empoweredDamage : 0);
    document.getElementById('playerAttack').textContent = visibleAttack;
    document.getElementById('playerDefense').textContent = player.defense;
    document.getElementById('playerSpeed').textContent = `${player.speed}（移动 ${Math.round((2.1 + player.speed * .24) * 10) / 10} / 攻速）`;
    document.getElementById('playerLevel').textContent = player.level;

    // 专属能力
    document.getElementById('passiveSkill').textContent = `被动·${player.passiveAbility.name}：${player.passiveAbility.desc}`;
    const activeButton = document.getElementById('activeSkillButton');
    const cooldownSeconds = Math.ceil(player.activeCooldown / TARGET_FPS);
    const skillIcon = player.activeAbility.effect === 'dash' ? '💨' : player.activeAbility.effect === 'empower' ? '⚡' : player.activeAbility.effect.includes('heal') ? '💚' : player.activeAbility.effect === 'shield' ? '🛡️' : '✨';
    activeButton.textContent = cooldownSeconds > 0
        ? `${skillIcon} ${player.activeAbility.name} · 冷却 ${cooldownSeconds}s`
        : `${skillIcon} ${player.activeAbility.name}（${controlMode === 'mobile' ? '点击' : '空格'}）`;
    activeButton.title = player.activeAbility.desc;
    activeButton.disabled = player.activeCooldown > 0;

    const provokeButton = document.getElementById('provokeButton');
    const canProvoke = ['ranked', 'tower'].includes(gameState.mode) && gameState.screen === 'playing';
    provokeButton.style.display = canProvoke ? 'block' : 'none';
    provokeButton.disabled = !canProvoke;
    provokeButton.textContent = gameState.provokeActive ? '🕊️ 取消找死' : '💢 找死·全员来战';

    // HP条
    const hpPercent = Math.max(0, player.hp / player.maxHp) * 100;
    document.getElementById('hpBar').style.width = hpPercent + '%';
    document.getElementById('hpText').textContent = `${Math.floor(Math.max(0, player.hp))}/${Math.floor(player.maxHp)}`;
    document.getElementById('upgradeNotice').textContent = gameState.lastUpgradeNotice || '';

    // 经验条
    const expPercent = (player.exp / player.expToLevel) * 100;
    document.getElementById('expBar').style.width = expPercent + '%';
    document.getElementById('expText').textContent = `${player.exp}/${player.expToLevel}`;

    // 游戏统计
    document.getElementById('killCount').textContent = gameState.stats.killCount;
    document.getElementById('highScore').textContent = gameState.stats.highScore;
    document.getElementById('enemyCount').textContent = gameState.enemies.length;
    document.getElementById('worldLevel').textContent = gameState.world.level;
    document.getElementById('modeLabel').textContent = gameState.mode === 'ranked' ? '排位' : `爬塔 ${gameState.world.level} 层`;
    document.getElementById('rankStatus').textContent = gameState.mode === 'ranked' ? `🏅 ${rankLabel()}` : '🗼 每 5 层 Boss';
}

// ============ 游戏循环 ============
let lastFrameTime = null;

function gameLoop(timestamp = performance.now()) {
    if (lastFrameTime === null) lastFrameTime = timestamp;
    const elapsedSeconds = Math.min((timestamp - lastFrameTime) / 1000, MAX_FRAME_DELTA);
    const frameScale = elapsedSeconds * TARGET_FPS;
    lastFrameTime = timestamp;

    if (gameState.screen === 'playing') {
        if (gameState.player.hp > 0) handleInput();
        else { gameState.player.vx = 0; gameState.player.vy = 0; }
        gameState.world.time += elapsedSeconds;
        if (gameState.player.hp > 0 && gameState.player.lastCombatTime !== undefined && gameState.world.time - gameState.player.lastCombatTime >= 5) {
            // 每完整一秒才结算一次回血，生命值始终保持整数。
            const player = gameState.player;
            player.regenProgress = (player.regenProgress || 0) + elapsedSeconds;
            const secondsToHeal = Math.floor(player.regenProgress);
            if (secondsToHeal > 0) {
                const healPerSecond = 1 + Math.max(0, Math.floor(player.regenBonus || 0));
                player.hp = Math.min(player.maxHp, player.hp + secondsToHeal * healPerSecond);
                player.regenProgress -= secondsToHeal;
            }
        } else {
            gameState.player.regenProgress = 0;
        }
        gameState.player.update(frameScale);
        if (gameState.mode === 'tutorial' && gameState.tutorial && gameState.tutorial.step === 0 && Math.hypot(gameState.player.vx, gameState.player.vy) > .05) {
            setTutorialStep(1);
        }
        updateTeamTargets();
        gameState.allies.forEach(ally => ally.update(frameScale));
        gameState.enemies.forEach(enemy => enemy.update(frameScale));
        updateBossSkills();
        if (gameState.mode !== 'team' && gameState.player.hp <= 0) {
            endGame();
            requestAnimationFrame(gameLoop);
            return;
        }
        
        // 更新粒子
        for (let i = gameState.particles.length - 1; i >= 0; i--) {
            gameState.particles[i].update(frameScale, gameState.player);
            if (gameState.particles[i].life <= 0) {
                gameState.particles.splice(i, 1);
            }
        }
        updateSkillEffects(frameScale);
        updateDamageNumbers(frameScale);
        
        checkCollisions();
        checkRankedAIBattles();
        checkTeamBattles();
        if (gameState.mode === 'ranked' && gameState.world.time - lastRankedSaveAt >= 1) {
            saveRankedRun();
            lastRankedSaveAt = gameState.world.time;
        }
        updateUI();
        render();
    } else if (gameState.screen === 'levelup') {
        showLevelUpSkills();
    }

    requestAnimationFrame(gameLoop);
}

// 启动游戏
window.addEventListener('load', () => {
    const container = document.getElementById('gameContainer');
    // 全屏时把所有弹窗也放进全屏容器，升级/胜负确认不会再卡在容器外。
    ['hallModal','subPageModal','tutorialModal','selectModal','levelUpModal','gameOverModal','saveChoiceModal','playerStats','gameStats'].forEach(id => {
        const element = document.getElementById(id); if (element) container.append(element);
    });
    init();
    init3DRenderer();
});
window.addEventListener('pagehide', saveRankedRun);
