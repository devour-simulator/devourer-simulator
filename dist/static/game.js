// ============ 游戏配置和常量 ============
const GAME_WIDTH = 1000;
document.title = '吞噬模拟器';
const GAME_HEIGHT = 700;
const TILE_SIZE = 50;
const TARGET_FPS = 60;
const MAX_FRAME_DELTA = 0.1; // 避免切回标签页时一次性跳过太多游戏时间
const S2_RELEASE_AT = new Date('2026-10-24T00:00:00+08:00').getTime();
function isSeasonContentReleased(season) {
    return !season || season === 'S1' || (season === 'S2' && Date.now() >= S2_RELEASE_AT);
}
function isHeroReleased(hero) { return !!hero && isSeasonContentReleased(hero.futureSeason); }
function isSkinReleased(skin) { return !!skin && isSeasonContentReleased(skin.futureSeason); }

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
        emoji: '🐻‍⬛',
        baseAttack: 8,
        baseDefense: 6,
        baseSpeed: 3,
        baseHp: 50,
        color: '#1d2226',
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
    hedgehog: { name: '刺猬', emoji: '🦔', baseAttack: 8, baseDefense: 8, baseSpeed: 6, baseHp: 54, color: '#8B4513', unlocked: false, unlockThreshold: 80 },
    crane: { name: '仙鹤', emoji: '🦢', baseAttack: 5, baseDefense: 3, baseSpeed: 10, baseHp: 35, color: '#E6E6FA', unlocked: false, unlockThreshold: 90 },
    giraffe: { name: '长颈鹿', emoji: '🦒', baseAttack: 7, baseDefense: 4, baseSpeed: 6, baseHp: 48, color: '#DAA520', unlocked: false, unlockThreshold: 100 }
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
    giraffe: { passive: { name: '长颈', desc: '最大生命 +5', bonus: { hp: 5 } }, active: { name: '长颈突击', desc: '下 2 次攻击额外 +7 伤害', effect: 'empower', bonus: 7, hits: 2, cooldown: 10 } }
};

// 第二批英雄：全部沿用“被动 + 主动”的平衡模板。它们会自动出现在图鉴、选人页、商城和敌人池中。
Object.assign(ANIMALS, {
    lion: { name: '非洲狮', emoji: '🦁', baseAttack: 13, baseDefense: 5, baseSpeed: 6, baseHp: 56, color: '#d99132', unlocked: false },
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
    llama: { name: '羊驼', emoji: '🦙', baseAttack: 6, baseDefense: 5, baseSpeed: 6, baseHp: 50, color: '#d7b78a', unlocked: false },
    goat: { name: '山羊', emoji: '🐐', baseAttack: 8, baseDefense: 4, baseSpeed: 7, baseHp: 45, color: '#d5d1c1', unlocked: false },
    squirrel: { name: '松鼠', emoji: '🐿️', baseAttack: 5, baseDefense: 2, baseSpeed: 10, baseHp: 34, color: '#bf733e', unlocked: false },
    africanElephant: { name: '非洲象', emoji: '🐘', baseAttack: 11, baseDefense: 9, baseSpeed: 3, baseHp: 82, color: '#687078', unlocked: false },
    northeastTiger: { name: '东北虎', emoji: '🐅', baseAttack: 14, baseDefense: 6, baseSpeed: 8, baseHp: 62, color: '#d98224', unlocked: false }
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
Object.assign(ANIMALS, {
    polarBear:{name:'北极熊',emoji:'🐻‍❄️',baseAttack:13,baseDefense:8,baseSpeed:5,baseHp:82,color:'#f2f6f7',unlocked:false},
    arcticFox:{name:'北极狐',emoji:'🦊',baseAttack:9,baseDefense:4,baseSpeed:11,baseHp:42,color:'#f2f7fc',unlocked:false},
    penguin:{name:'帝企鹅',emoji:'🐧',baseAttack:8,baseDefense:7,baseSpeed:6,baseHp:62,color:'#1f2935',unlocked:false},
    walrus:{name:'海象',emoji:'🦭',baseAttack:12,baseDefense:9,baseSpeed:4,baseHp:88,color:'#9b725b',unlocked:false},
    snowOwl:{name:'雪鸮',emoji:'🦉',baseAttack:10,baseDefense:5,baseSpeed:10,baseHp:48,color:'#f5f7f5',unlocked:false},
    muskOx:{name:'麝牛',emoji:'🐂',baseAttack:11,baseDefense:9,baseSpeed:5,baseHp:78,color:'#4c4038',unlocked:false},
    arcticHare:{name:'雪兔',emoji:'🐇',baseAttack:8,baseDefense:3,baseSpeed:14,baseHp:38,color:'#ffffff',unlocked:false},
    arcticWolf:{name:'北极狼',emoji:'🐺',baseAttack:11,baseDefense:5,baseSpeed:9,baseHp:56,color:'#d9e2e8',unlocked:false},
    puffin:{name:'海鹦',emoji:'🐧',baseAttack:9,baseDefense:4,baseSpeed:10,baseHp:44,color:'#283344',unlocked:false},
    narwhal:{name:'独角鲸',emoji:'🐋',baseAttack:11,baseDefense:6,baseSpeed:8,baseHp:60,color:'#a5c5d8',unlocked:false},
    emperorPenguin:{name:'王企鹅',emoji:'🐧',baseAttack:10,baseDefense:8,baseSpeed:6,baseHp:70,color:'#202733',unlocked:false},
    reindeer:{name:'驯鹿',emoji:'🦌',baseAttack:9,baseDefense:5,baseSpeed:9,baseHp:56,color:'#8b6c52',unlocked:false}
});
ANIMALS.seasonStag = { name:'星角鹿', emoji:'🦌', baseAttack:10, baseDefense:6, baseSpeed:9, baseHp:58, color:'#6f73c8', unlocked:false, rewardOnly:true, seasonReward:true, rarityOverride:'mythic' };
ABILITIES.seasonStag = {
    passive:{ name:'万兽引路', desc:'为同行的万兽点亮方向：速度 +1、最大生命 +5', bonus:{ speed:1, hp:5 } },
    active:{ name:'启程号角', desc:'沿万兽足迹向前冲锋 200 像素并撞击路径上的敌人', effect:'dash', distance:200, cooldown:9 }
};
// S2“深海觉醒”内容会提前随版本发布，但在赛季开始前不会进入图鉴、选人或敌人池。
ANIMALS.abyssSwordfish = { name:'潮汐剑鱼', emoji:'🐟', baseAttack:12, baseDefense:5, baseSpeed:11, baseHp:52, color:'#245f91', unlocked:false, rewardOnly:true, seasonReward:true, futureSeason:'S2', rarityOverride:'mythic' };
ABILITIES.abyssSwordfish = {
    passive:{ name:'深海觉醒', desc:'攻击 +1、速度 +1', bonus:{ attack:1, speed:1 } },
    active:{ name:'破浪穿刺', desc:'用长吻向前冲刺 220 像素并撞击路径上的敌人', effect:'dash', distance:220, cooldown:9 }
};
const POLAR_HERO_KEYS=['polarBear','arcticFox','penguin','walrus','snowOwl','muskOx','arcticHare','arcticWolf','puffin','narwhal','emperorPenguin','reindeer'];
// 极地奖励按强度逐步发放：先史诗，再神话，最后才是传说。
const POLAR_REWARD_ORDER=['penguin','snowOwl','reindeer','arcticWolf','narwhal','emperorPenguin','polarBear','walrus','muskOx','arcticFox','arcticHare','puffin'];
// 两条奖励路线都从史诗开始，再升到神话和传说，避免新玩家一开始就跳到传说英雄。
const POLAR_RANK_REWARDS=['penguin','emperorPenguin','arcticHare','arcticWolf','narwhal','polarBear'];
const POLAR_LEVEL_REWARDS=['snowOwl','reindeer','puffin','emperorPenguin','muskOx','walrus'];
POLAR_HERO_KEYS.forEach(key => { ANIMALS[key].rewardOnly = true; });
['seal','whale','orca','octopus','jellyfish','falcon','albatross','hummingbird','swan','condor','pelican','flamingo','raven','pigeon','goose','cockatoo','kitebird','polarBear','arcticFox','penguin','walrus','snowOwl','muskOx','arcticHare','arcticWolf','puffin','narwhal','emperorPenguin','reindeer'].forEach(type => {
    const hero=ANIMALS[type];
    ABILITIES[type]=hero.baseSpeed>=10
        ? {passive:{name:'迅捷',desc:'速度 +1',bonus:{speed:1}},active:{name:'俯冲冲撞',desc:'沿面向冲撞并造成伤害',effect:'dash',distance:190,cooldown:9}}
        : {passive:{name:'猎手本能',desc:'攻击 +1',bonus:{attack:1}},active:{name:'实体突袭',desc:'发射穿透地图的实体攻击',effect:'empower',bonus:10,hits:1,cooldown:10}};
});
Object.assign(ABILITIES, {
    hedgehog:{ passive:{name:'尖刺护甲',desc:'防御 +1',bonus:{defense:1}}, active:{name:'荆棘反伤',desc:'接下来 4 次受击反弹 50% 实际伤害',effect:'reflect',hits:4,ratio:.5,cooldown:12}},
    octopus:{ passive:{name:'拟态',desc:'速度 +1',bonus:{speed:1}}, active:{name:'墨汁喷射',desc:'附近敌人减速，自己加速 3 秒',effect:'ink',cooldown:11}},
    jellyfish:{ passive:{name:'电流毒素',desc:'攻击 +1',bonus:{attack:1}}, active:{name:'毒刺云',desc:'附近敌人中毒并持续掉血',effect:'poison',cooldown:12}}
});

// 第二轮技能重做：每种动物都用符合自身习性的可见攻击、冲撞或护体效果。
const REALISTIC_SKILLS = {
    lion:['狮吼震慑','咆哮光环让附近敌人减速', 'ink',{}], dog:['飞扑','向前飞扑撞击敌人','dash',{distance:170}], raccoon:['石块投掷','投出穿透石块','empower',{bonus:15,hits:1}],
    koala:['桉叶护盾','桉叶护体减伤','shield',{hits:3,reduction:.5}], sloth:['藤蔓疗愈','藤蔓光环回复生命','heal',{amount:.35}], kangaroo:['袋鼠飞踢','连续跳踢冲撞','dash',{distance:185}],
    zebra:['斑马冲锋','疾驰冲过敌群','dash',{distance:180}], hippo:['河马水盾','水花护体减伤','shield',{hits:3,reduction:.55}], rhino:['犀角冲撞','沿指示线发动犀角冲锋','dash',{distance:180}],
    crocodile:['死亡翻滚','甩出旋转水刃','empower',{bonus:11,hits:2}], turtle:['缩壳','生成坚硬龟壳护盾','shield',{hits:4,reduction:.55}], penguin:['雪球投掷','投出一颗雪球','empower',{bonus:10,hits:1}],
    dolphin:['破浪突袭','高速破浪冲撞','dash',{distance:190}], shark:['深海撕咬','射出鲨齿冲击波','empower',{bonus:18,hits:1}], bat:['超声波','超声光环让附近敌人减速','ink',{}],
    parrot:['彩羽飞针','射出一根彩色羽针','empower',{bonus:11,hits:1}], llama:['口水弹','吐出穿透口水弹','empower',{bonus:10,hits:1}],
    goat:['羊角顶撞','低头冲锋撞击','dash',{distance:170}], squirrel:['松果投掷','投出一颗松果','empower',{bonus:9,hits:2}], seal:['浪花拍击','发射浪花冲击','empower',{bonus:10,hits:1}],
    whale:['鲸歌震波','鲸歌光环让附近敌人减速','ink',{}], orca:['破浪突袭','高速破浪冲撞','dash',{distance:195}], falcon:['猎隼俯冲','极速俯冲撞击','dash',{distance:195}],
    albatross:['海风护翼','海风护翼减伤','shield',{hits:2,reduction:.45}], hummingbird:['花蜜针刺','射出高速花蜜针','empower',{bonus:9,hits:2}], swan:['羽翼守护','白羽护环减伤','shield',{hits:3,reduction:.45}],
    condor:['安第斯俯冲','重型俯冲撞击','dash',{distance:185}], pelican:['鱼群抛射','抛出穿透鱼群','empower',{bonus:12,hits:1}], flamingo:['火烈鸟突刺','长腿突刺向前冲撞','dash',{distance:175}],
    raven:['暗羽飞刃','射出黑羽飞刃','empower',{bonus:13,hits:1}], pigeon:['信笺飞投','投出一封穿透战场的信','empower',{bonus:9,hits:1}], goose:['振翅防风','振翅形成防风护盾','shield',{hits:3,reduction:.5}],
    cockatoo:['冠羽飞针','射出明亮冠羽飞针','empower',{bonus:11,hits:1}], kitebird:['借风冲刺','借风向前超远冲刺','dash',{distance:205}], polarBear:['冰原熊掌','发射冰原熊掌冲击','empower',{bonus:16,hits:1}],
    arcticFox:['雪影突袭','雪影穿过敌群','dash',{distance:195}], walrus:['长牙冲锋','长牙向前冲锋','dash',{distance:175}], snowOwl:['雪羽风暴','射出白色雪羽风暴','empower',{bonus:13,hits:1}],
    muskOx:['麝牛顶撞','低头顶撞冲锋','dash',{distance:175}], arcticHare:['雪兔三段跳','快速跃过敌群','dash',{distance:200}], arcticWolf:['冰牙飞斩','射出冰牙飞斩','empower',{bonus:14,hits:1}],
    puffin:['飞鱼投掷','投出一条飞鱼','empower',{bonus:11,hits:1}], narwhal:['独角穿刺','独角直线穿刺','dash',{distance:190}], emperorPenguin:['冰壁守护','冰壁护环抵挡伤害','shield',{hits:3,reduction:.55}],
    reindeer:['鹿角雪橇冲锋','鹿角向前冲锋','dash',{distance:185}],
    africanElephant:['象牙践踏','低头发动象牙冲锋，撞开前方敌人','dash',{distance:185}],
    northeastTiger:['山林扑杀','猛虎扑向前方，造成强力撞击','dash',{distance:190}]
};
Object.entries(REALISTIC_SKILLS).forEach(([type, [name, desc, effect, values]]) => {
    const hero = ANIMALS[type];
    ABILITIES[type] = {
        passive: hero.baseAttack >= 10 ? {name:'天生猎手',desc:'攻击 +1',bonus:{attack:1}} : hero.baseDefense >= 7 ? {name:'坚韧体魄',desc:'防御 +1',bonus:{defense:1}} : {name:'敏捷本能',desc:'速度 +1',bonus:{speed:1}},
        active: {name, desc, effect, cooldown: effect === 'dash' ? 10 : effect === 'heal' ? 13 : 11, ...values}
    };
});

// 进化试炼是独立的实验玩法：仅开放少数基础英雄，升到 Lv.25 后才会觉醒为传说形态。
const EVOLUTION_ROUTES = {
    fox: { name:'九尾狐', emoji:'🦊', color:'#e9b7ff', level:25, bonus:{attack:9,defense:4,speed:4,hp:55}, active:{name:'九尾狐火',desc:'狐火震慑附近敌人，自己短暂加速',effect:'ink',cooldown:8} },
    falcon: { name:'不死火凤凰', emoji:'🐦‍🔥', color:'#ff5c2e', level:25, bonus:{attack:11,defense:6,speed:3,hp:65}, active:{name:'涅槃烈焰',desc:'恢复 35% 最大生命并获得减伤护盾',effect:'healShield',amount:.35,hits:2,reduction:.55,cooldown:10} },
    wolf: { name:'月影狼王', emoji:'🐺', color:'#8da2da', level:25, bonus:{attack:10,defense:3,speed:6,hp:58}, active:{name:'月影突袭',desc:'向前冲刺并撞击路径上的敌人',effect:'dash',distance:230,cooldown:8} },
    shark: { name:'巨齿鲨', emoji:'🦈', color:'#315d77', level:25, bonus:{attack:13,defense:5,speed:3,hp:72}, active:{name:'巨力虹吸',desc:'将 280 范围内的敌人吸到身边，造成攻击力 280% 的伤害',effect:'pull',radius:280,damagePercent:280,cooldown:11} },
    hedgehog: { name:'荆棘兽王', emoji:'🦔', color:'#7a4f31', level:25, bonus:{attack:7,defense:10,speed:3,hp:70}, active:{name:'万刺反击',desc:'受到攻击时反弹 70% 伤害',effect:'reflect',hits:6,ratio:.7,cooldown:10} }
};
const EVOLUTION_MODE_TYPES = Object.keys(EVOLUTION_ROUTES);
function isRankProgressMode(mode = gameState.mode) { return mode === 'ranked' || mode === 'evolution'; }

// 所有发射光波、冲击波和实体投射物的技能，统一按攻击力百分比结算并把数值写进介绍。
function applyProjectileDamagePercent(active, hero) {
    if (!active || active.effect !== 'empower') return;
    const baseAttack = Math.max(1, hero?.baseAttack || 10);
    active.damagePercent = active.damagePercent || Math.round((1 + (active.bonus || 0) / baseAttack) * 100);
    if (!active.desc.includes('攻击力')) active.desc += `（造成攻击力 ${active.damagePercent}% 伤害）`;
}
Object.entries(ABILITIES).forEach(([type, ability]) => applyProjectileDamagePercent(ability.active, ANIMALS[type]));
Object.entries(EVOLUTION_ROUTES).forEach(([type, route]) => applyProjectileDamagePercent(route.active, ANIMALS[type]));

function tryEvolvePlayer(player) {
    if (gameState.mode !== 'evolution' || player.evolved) return false;
    const route = EVOLUTION_ROUTES[player.type];
    if (!route || player.level < route.level) return false;
    player.evolved = true;
    player.evolution = route;
    player.name = route.name;
    player.emoji = route.emoji;
    player.color = route.color;
    player.attack += route.bonus.attack;
    player.defense += route.bonus.defense;
    player.speed += route.bonus.speed;
    player.maxHp += route.bonus.hp;
    player.hp = player.maxHp;
    player.radius += 7;
    player.activeAbility = route.active;
    const previousPlayerMesh = threeMeshes?.get('player');
    if (previousPlayerMesh) { threeScene?.remove(previousPlayerMesh); threeMeshes.delete('player'); }
    gameState.evolutionMessage = `✨ 传说进化！${route.name}觉醒，获得全新能力与强大属性。`;
    return true;
}
const OCEAN_TYPES=['dolphin','shark','seal','whale','orca','octopus','jellyfish','narwhal','abyssSwordfish'].filter(type => isHeroReleased(ANIMALS[type]));
const SKY_TYPES=['eagle','owl','crane','phoenix','bat','parrot','falcon','albatross','hummingbird','swan','condor','pelican','raven','pigeon','goose','cockatoo','kitebird'].filter(type => isHeroReleased(ANIMALS[type]));
// 雪狼本身是极地动物，也应和北极英雄一起进入极地场景与敌人池。
// 独角鲸虽然是极地奖励英雄，但战斗栖息地是海洋，不能生成在雪地上。
const POLAR_TYPES=[...POLAR_HERO_KEYS.filter(type => type !== 'narwhal'),'wolf'].filter(type => isHeroReleased(ANIMALS[type]));
const POND_TYPES=['crocodile','otter','hippo','flamingo','turtle','elephant'].filter(type => isHeroReleased(ANIMALS[type]));
const SAVANNA_TYPES=['lion','africanElephant','giraffe','zebra','rhino'].filter(type => isHeroReleased(ANIMALS[type]));
const LAND_TYPES=Object.keys(ANIMALS).filter(type => isHeroReleased(ANIMALS[type]) && !OCEAN_TYPES.includes(type) && !SKY_TYPES.includes(type) && !POLAR_TYPES.includes(type) && !POND_TYPES.includes(type) && !SAVANNA_TYPES.includes(type));
function environmentFor(type){ return (OCEAN_TYPES.includes(type) || type === 'abyssSwordfish')?'ocean':SKY_TYPES.includes(type)?'sky':POLAR_TYPES.includes(type)?'polar':POND_TYPES.includes(type)?'pond':SAVANNA_TYPES.includes(type)?'savanna':'land'; }

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
    if (hero.rarityOverride) return hero.rarityOverride;
    const power = calculateHeroPower(hero);
    if (power >= 330) return 'legendary';
    if (power >= 300) return 'mythic';
    if (power >= 260) return 'epic';
    if (power >= 215) return 'rare';
    return 'normal';
}
ANIMALS.hedgehog.rarityOverride = 'epic';
ANIMALS.northeastTiger.rarityOverride = 'legendary';
ANIMALS.lion.rarityOverride = 'mythic';
function heroRarityMarkup(hero) {
    const rarity = heroRarity(hero);
    return `<span class="hero-rarity hero-rarity-${rarity}">${HERO_RARITY_INFO[rarity]}</span>`;
}
function heroesByPower(entries = Object.entries(ANIMALS)) {
    return [...entries].filter(([, hero]) => isHeroReleased(hero)).sort(([, a], [, b]) => calculateHeroPower(a) - calculateHeroPower(b) || a.name.localeCompare(b.name));
}
function heroesByRarity(entries = Object.entries(ANIMALS)) {
    return [...entries].filter(([, hero]) => isHeroReleased(hero)).sort(([, a], [, b]) => {
        const rarityOrder = HERO_QUALITY_ORDER[heroRarity(a)] - HERO_QUALITY_ORDER[heroRarity(b)];
        return rarityOrder || calculateHeroPower(a) - calculateHeroPower(b) || a.name.localeCompare(b.name);
    });
}
function heroIconMarkup(key, hero, skin = null) {
    if (key === 'seasonStag' && skin?.id === 'starbloom') return '<span class="skin-hero-icon starbloom-stag-icon" role="img" aria-label="繁星花冠">🦌<i>🐾</i><b>✦</b></span>';
    if (key === 'abyssSwordfish') return `<span class="skin-hero-icon" role="img" aria-label="${skin?.id === 'thunderTide' ? '雷渊潮汐' : '潮汐剑鱼'}">🐟${skin?.id === 'thunderTide' ? '<i>⚡</i>' : ''}</span>`;
    if (key === 'hedgehog' && skin?.id === 'durian') return '<span class="durian-hedgehog-icon" role="img" aria-label="榴莲刺猬">🦔</span>';
    if (key === 'fox' && skin?.id === 'moon') return '<span class="skin-hero-icon moon-fox-icon" role="img" aria-label="月影灵狐">🦊<i>☾</i></span>';
    if (key === 'shark' && skin?.id === 'nebula') return '<span class="skin-hero-icon nebula-shark-icon" role="img" aria-label="星海巨鲨">🦈<i>✦</i><b>✦</b></span>';
    if (key === 'lion' && skin?.id === 'solar') return '<span class="skin-hero-icon solar-lion-icon" role="img" aria-label="星穹狮王">🦁<i>✦</i></span>';
    if (key === 'orca') return '<span class="orca-icon" role="img" aria-label="虎鲸"><i></i><b class="orca-eye-patch"></b><b class="orca-belly-patch"></b></span>';
    if (key === 'bear') return '<span class="black-bear-icon" role="img" aria-label="黑熊"><i></i><b></b><b></b></span>';
    if (key === 'pigeon') return '<span class="pigeon-icon" role="img" aria-label="信鸽"><i>✉</i></span>';
    if (key === 'snowOwl') return '<span class="snow-owl-icon" role="img" aria-label="白色雪鸮">🦉</span>';
    if (key === 'puffin') return '<span class="puffin-icon" role="img" aria-label="彩嘴海鹦"><i></i><b></b></span>';
    const raptorIcons = { eagle:'eagle', falcon:'falcon', condor:'condor', kitebird:'kite' };
    if (raptorIcons[key]) return `<span class="bird-icon bird-icon-${raptorIcons[key]}" role="img" aria-label="${hero.name}"><i></i><b></b><b></b><em></em></span>`;
    return hero.emoji;
}

// 皮肤不会改变面板数值，只改变进入对局后的配色；拥有英雄后即可在“英雄”页选择。
const HERO_SKINS = {
    lion:[{id:'default',name:'草原雄狮',color:'#d99132'},{id:'sunset',name:'落日雄狮',color:'#c56a2f',effectColor:'#ff642e',price:4000},{id:'solar',name:'星穹狮王',color:'#29305f',effectColor:'#72d9ff',price:25000}],
    tiger:[{id:'default',name:'橙纹猛虎',color:'#FF8C00'}],
    northeastTiger:[{id:'default',name:'东北虎',color:'#d98224'},{id:'snow',name:'雪林虎王',color:'#eef1ee',effectColor:'#83d9ff',price:4000}],
    shark:[{id:'default',name:'深海灰鲨',color:'#63869b'},{id:'abyss',name:'深渊蓝鲨',color:'#274e72',effectColor:'#215fc9',price:4000},{id:'nebula',name:'星海巨鲨',color:'#261857',effectColor:'#a45dff',price:15000}],
    flamingo:[{id:'default',name:'粉羽火烈鸟',color:'#ef7fa8'},{id:'coral',name:'珊瑚火烈鸟',color:'#ff6a68',effectColor:'#ff3e73',price:4000}],
    hedgehog:[{id:'default',name:'森林刺猬',color:'#8B4513'},{id:'durian',name:'榴莲刺猬',color:'#c7a52c',effectColor:'#c7d84a',price:10000}],
    fox:[{id:'default',name:'森林小狐',color:'#e28743'},{id:'rose',name:'玫瑰赤狐',color:'#d95d7a',effectColor:'#ef5f96',price:4000},{id:'moon',name:'月影灵狐',color:'#7767d7',effectColor:'#b79cff',price:10000}],
    eagle:[{id:'default',name:'苍穹猎鹰',color:'#DAA520'},{id:'aurora',name:'极光苍鹰',color:'#6bb7da',effectColor:'#61f0d1',price:6000,rarity:'rare'}],
    seasonStag:[{id:'default',name:'启程星角鹿',color:'#6f73c8'},{id:'starbloom',name:'繁星花冠',color:'#7047b8',effectColor:'#8ff0c7',rarity:'epic',battlePassOnly:true,themeText:'万兽足迹与启程星路'}],
    abyssSwordfish:[{id:'default',name:'潮汐剑鱼',color:'#245f91',futureSeason:'S2'},{id:'thunderTide',name:'雷渊潮汐',color:'#25236f',effectColor:'#50bfff',rarity:'epic',battlePassOnly:true,futureSeason:'S2'}]
};
function ownedSkinKeys() {
    try { return new Set(JSON.parse(localStorage.getItem('ownedSkins') || '[]')); } catch { return new Set(); }
}
function skinKey(type, id) { return `${type}:${id}`; }
function ownsSkin(type, skin) { return skin?.id === 'default' || ownedSkinKeys().has(skinKey(type, skin.id)); }
function getSelectedHeroSkin(type) {
    const trial = gameState?.skinTrial;
    const skins = HERO_SKINS[type]?.filter(skin => isSkinReleased(skin) || (trial?.allowPreview && trial.type === type && trial.skinId === skin.id));
    if (!skins?.length) return null;
    if (trial?.type === type) return skins.find(skin => skin.id === trial.skinId) || skins[0];
    const saved = localStorage.getItem(`heroSkin:${type}`) || 'default';
    const selected = skins.find(skin => skin.id === saved) || skins[0];
    return ownsSkin(type, selected) ? selected : skins[0];
}
// 所有皮肤可单独定义技能色；将来只填 effectColor（不填则自动沿用皮肤配色）即可生效。
function skillEffectColor(owner) { return owner?.skin?.effectColor || owner?.skin?.color || owner?.color || '#62cfff'; }
const SKIN_RARITY_INFO = {
    normal:{ label:'普通', color:'#8b97a5' }, rare:{ label:'稀有', color:'#3989e8' }, epic:{ label:'史诗', color:'#8f55d4' }, mythic:{ label:'神话', color:'#d64b51' }, legendary:{ label:'传说', color:'#e59a20' }
};
const SKIN_RARITY_ORDER = ['normal','rare','epic','mythic','legendary'];
function skinRarity(skin) {
    // 默认外观不计入皮肤图鉴；商城的换色皮肤为普通，榴莲刺猬是史诗。
    if (skin.rarity) return skin.rarity;
    if (['durian','moon'].includes(skin.id)) return 'epic';
    if (skin.id === 'nebula') return 'mythic';
    if (skin.id === 'solar') return 'legendary';
    return 'normal';
}
const SKIN_FRAGMENT_COST = { normal:100, rare:100, epic:100, mythic:100, legendary:100 };
function addSkinFragments(rewards) {
    const fragments = rewards?.skinFragments || {};
    Object.entries(fragments).forEach(([rarity, amount]) => gameState.account.inventory[`fragment_${rarity}`] = (gameState.account.inventory[`fragment_${rarity}`] || 0) + amount);
}
function redeemSkinFragments(type, skinId) {
    const skin = HERO_SKINS[type]?.find(item => item.id === skinId && isSkinReleased(item)), rarity = skin && skinRarity(skin);
    if (!skin || !SKIN_FRAGMENT_COST[rarity] || ownsSkin(type, skin)) return;
    const key = `fragment_${rarity}`, cost = SKIN_FRAGMENT_COST[rarity];
    if ((gameState.account.inventory[key] || 0) < cost) return window.alert(`${SKIN_RARITY_INFO[rarity].label}皮肤碎片不足！需要 ${cost} 个。`);
    if (!window.confirm(`确定使用 ${cost} 个${SKIN_RARITY_INFO[rarity].label}皮肤碎片兑换「${skin.name}」吗？`)) return;
    gameState.account.inventory[key] -= cost;
    const owned = ownedSkinKeys(); owned.add(skinKey(type, skin.id)); localStorage.setItem('ownedSkins', JSON.stringify([...owned])); saveAccount();
    window.alert(`兑换成功！获得「${skin.name}」。`); openAccountPanel('shop'); switchShopTab('fragment');
}
window.redeemSkinFragments = redeemSkinFragments;
function skinRarityMarkup(skin) {
    const rarity = skinRarity(skin), info = SKIN_RARITY_INFO[rarity];
    return `<span class="hero-rarity hero-rarity-${rarity}"${rarity === 'legendary' ? '' : ` style="background:${info.color}"`}>${info.label}皮肤</span>`;
}
function sortSkinEntriesByRarity(entries) {
    return [...entries].sort((a, b) => SKIN_RARITY_ORDER.indexOf(skinRarity(a.skin)) - SKIN_RARITY_ORDER.indexOf(skinRarity(b.skin)) || (a.skin.price || 0) - (b.skin.price || 0) || a.skin.name.localeCompare(b.skin.name));
}
function selectHeroSkin(type, skinId, returnPanel = 'hero') {
    if (!ANIMALS[type]?.unlocked) return window.alert('请先解锁该英雄。');
    const skin = HERO_SKINS[type]?.find(item => item.id === skinId && isSkinReleased(item));
    if (!skin) return;
    if (!ownsSkin(type, skin)) {
        if (skin.battlePassOnly) return window.alert(`该皮肤需要通过 ${skin.futureSeason || 'S1'} 进阶战令 Lv.50 获得。`);
        if (!window.confirm(`确定花费 ${skin.price} 金币购买「${skin.name}」吗？`)) return;
        if (gameState.stats.coins < skin.price) return window.alert('您的金币不足！');
        gameState.stats.coins -= skin.price;
        const owned = ownedSkinKeys(); owned.add(skinKey(type, skin.id));
        localStorage.setItem('ownedSkins', JSON.stringify([...owned]));
        localStorage.setItem('coins', gameState.stats.coins);
        window.alert(`购买成功！已获得「${skin.name}」。`);
        // 购买只加入皮肤库，不会悄悄替换玩家正在使用的外观；要穿戴需再次点击“使用皮肤”。
        openAccountPanel(returnPanel);
        if (returnPanel === 'shop') switchShopTab('skin');
        return;
    }
    localStorage.setItem(`heroSkin:${type}`, skin.id);
    openAccountPanel(returnPanel);
}
window.selectHeroSkin = selectHeroSkin;
function startSkinTrial(type, skinId, allowPreview = false) {
    const skin = HERO_SKINS[type]?.find(item => item.id === skinId && (isSkinReleased(item) || allowPreview));
    if (!skin) return;
    gameState.skinTrial = { type, skinId, allowPreview:!!allowPreview, respawnPending: false, playerRespawnPending: false };
    gameState.mode = 'skinTrial';
    document.getElementById('subPageModal').classList.add('hidden');
    startGame(type);
    // 试玩只安排一名训练对手，不产生宝箱、金币、段位或账号经验奖励。
    const foeType = environmentFor(type) === 'ocean' ? 'shark' : 'rabbit';
    const foe = new Enemy(foeType, Math.min(GAME_WIDTH - 100, gameState.player.x + 270), gameState.player.y);
    foe.name = foeType === 'shark' ? '试玩训练鲨' : '试玩训练兔'; foe.maxHp = 45; foe.hp = 45; foe.attack = 3; foe.defense = 1;
    gameState.enemies = [foe]; gameState.particles = []; gameState.chests = [];
}
window.startSkinTrial = startSkinTrial;

function queueSkinTrialOpponent() {
    const trial = gameState.skinTrial;
    if (!trial || trial.respawnPending) return;
    trial.respawnPending = true;
    window.setTimeout(() => {
        const activeTrial = gameState.skinTrial;
        if (!activeTrial || gameState.screen !== 'playing' || gameState.mode !== 'skinTrial' || !gameState.player) return;
        // 即便敌人尚未从列表清掉，也要解除等待状态；下一帧会再次检查，避免试玩永远不刷新。
        if (gameState.enemies.length) { activeTrial.respawnPending = false; return; }
        activeTrial.respawnPending = false;
        const angle = Math.random() * Math.PI * 2;
        const distance = 220 + Math.random() * 100;
        const x = Math.max(70, Math.min(GAME_WIDTH - 70, gameState.player.x + Math.cos(angle) * distance));
        const y = Math.max(70, Math.min(GAME_HEIGHT - 70, gameState.player.y + Math.sin(angle) * distance));
        // 试玩固定刷新训练兔，目标明确，也不会因为场景动物配置缺失而卡住。
        const foeType = environmentFor(activeTrial.type) === 'ocean' ? 'shark' : 'rabbit';
        const foe = new Enemy(foeType, x, y);
        foe.name = foeType === 'shark' ? '试玩训练鲨' : '试玩训练兔';
        foe.maxHp = 50; foe.hp = 50; foe.attack = 4; foe.defense = 1;
        gameState.enemies = [foe];
    }, 1400);
}

function respawnSkinTrialPlayer() {
    const trial = gameState.skinTrial;
    const player = gameState.player;
    if (!trial || !player || trial.playerRespawnPending) return;
    trial.playerRespawnPending = true;
    player.hp = 0;
    player.vx = 0;
    player.vy = 0;
    gameState.rankItemNotice = '💫 试玩中被击败，1.2 秒后在地图中央复活。';
    window.setTimeout(() => {
        if (gameState.mode !== 'skinTrial' || gameState.screen !== 'playing' || gameState.skinTrial !== trial || !gameState.player) return;
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;
        gameState.obstacles = (gameState.obstacles || []).filter(obstacle => Math.hypot(obstacle.x - centerX, obstacle.y - centerY) > obstacle.radius + gameState.player.radius + 32);
        gameState.player.x = gameState.player.targetX = centerX;
        gameState.player.y = gameState.player.targetY = centerY;
        gameState.player.vx = 0;
        gameState.player.vy = 0;
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.invulnerableTicks = 1.5 * TARGET_FPS;
        trial.playerRespawnPending = false;
        gameState.rankItemNotice = '🛡️ 已在地图中央复活，并获得 1.5 秒无敌时间。';
    }, 1200);
}

function exitSkinTrialToHall() {
    gameState.skinTrial = null;
    gameState.player = null;
    gameState.enemies = [];
    gameState.particles = [];
    gameState.skillEffects = [];
    gameState.killEffects = [];
    gameState.chests = [];
    gameState.screen = 'hall';
    exitGameFullscreen();
    document.getElementById('skinTrialExitButton').hidden = true;
    showHall();
}
window.exitSkinTrialToHall = exitSkinTrialToHall;
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
SKILLS.push(
    { name:'连击节奏', desc:'连击率 +3%', type:'combo', value:.03, rarity:'normal' },
    { name:'双重追击', desc:'攻击 +3，连击率 +5%', type:'compound', value:{attack:3,combo:.05}, rarity:'rare' },
    { name:'疾影连斩', desc:'速度 +3，连击率 +7%', type:'compound', value:{speed:3,combo:.07}, rarity:'epic' },
    { name:'无尽连击', desc:'攻击 +8，连击率 +10%', type:'compound', value:{attack:8,combo:.10}, rarity:'mythic' },
    { name:'风暴连环', desc:'攻击 +14，连击率 +12%，暴击率 +10%', type:'compound', value:{attack:14,combo:.12,crit:.10}, rarity:'legendary' }
);
const MAX_COMBO_CHANCE = 1;

const SHOP_ITEMS = {
    renameCard: { name:'改名卡', emoji:'🪪', price:10000, desc:'在背包中使用，用于修改玩家名字。' },
    rankStarCard: { name:'排位加星卡', emoji:'⭐', price:3500, desc:'排位结算获得星星时自动使用，在原有奖励基础上额外 +1 星。' },
    rankProtectCard: { name:'排位保护卡', emoji:'🛡️', price:3500, desc:'排位失败需要扣星时自动使用，本局不扣星。' }
};
// 宝箱会掉落以下战斗道具；拾取后立即生效，不占背包格子。
const CHEST_ITEMS = {
    magnet: { name:'星尘吸铁石', emoji:'🧲', desc:'持续 12 秒，吸取 280 码内的经验点。', color:'#57b7ff' },
    expScroll: { name:'成长卷轴', emoji:'📜', desc:'立刻获得 100 点经验。', color:'#c785ff' },
    battleTonic: { name:'锋芒药剂', emoji:'🧪', desc:'持续 15 秒，攻击力 +8。', color:'#ff7a4f' }
};

const RARITY_INFO = { normal:{label:'普通',weight:55}, rare:{label:'稀有',weight:26}, epic:{label:'史诗',weight:12}, mythic:{label:'神话',weight:5}, legendary:{label:'传奇',weight:2} };

const RANK_TIERS = ['青铜', '白银', '黄金', '铂金', '钻石', '星耀', '王者'];
function loadRank() {
    const tier = Math.max(0, Math.min(RANK_TIERS.length - 1, parseInt(localStorage.getItem('rankTier')) || 0));
    const isKing = tier === RANK_TIERS.length - 1;
    return {
        tier,
        // 王者没有“几段”，旧存档进入王者后也会自动整理为星数制。
        division: isKing ? 0 : Math.max(1, Math.min(3, parseInt(localStorage.getItem('rankDivision')) || 3)),
        stars: isKing ? Math.max(1, parseInt(localStorage.getItem('rankStars')) || 1) : Math.max(0, Math.min(2, parseInt(localStorage.getItem('rankStars')) || 0))
    };
}
function rankLabel() {
    const rank = gameState.rank;
    return rank.tier === RANK_TIERS.length - 1 ? `王者 · ${rank.stars} 星` : `${RANK_TIERS[rank.tier]} ${rank.division} · ${rank.stars} 星`;
}
function changeRankStars(delta) {
    const rank = gameState.rank;
    const tierBefore = rank.tier;
    const direction = delta >= 0 ? 1 : -1;
    for (let step = 0; step < Math.abs(delta); step++) {
        if (rank.tier === RANK_TIERS.length - 1) {
            rank.division = 0;
            if (direction > 0) { rank.stars++; continue; }
            if (rank.stars > 1) { rank.stars--; continue; }
            rank.tier--; rank.division = 1; rank.stars = 2;
            continue;
        }
        if (direction > 0) {
            rank.stars++;
            if (rank.stars >= 3) {
                rank.stars = 0;
                if (rank.division > 1) rank.division--;
                else if (rank.tier < RANK_TIERS.length - 2) { rank.tier++; rank.division = 3; }
                else {
                    // 登上王者先固定获得 1 星；若本局结算本身还有额外星数（例如登顶 +4），
                    // 则在这颗基础星上继续叠加，成为王者 5 星。
                    rank.tier++; rank.division = 0; rank.stars = 1;
                    if (Math.abs(delta) > 1) { rank.stars += Math.abs(delta); break; }
                }
            }
        } else if (rank.stars > 0) rank.stars--;
        else if (rank.division < 3) { rank.division++; rank.stars = 2; }
        else if (rank.tier > 0) { rank.tier--; rank.division = 1; rank.stars = 2; }
    }
    localStorage.setItem('rankTier', rank.tier);
    localStorage.setItem('rankDivision', rank.division);
    localStorage.setItem('rankStars', rank.stars);
    if (rank.tier > tierBefore) grantEligiblePolarRewards();
}

// 每个新赛季只执行一次段位继承。大段位区间下降三个大段位；黄金及以下按小段位下降，青铜保底不变。
function applySeasonRankInheritance(seasonId) {
    if (!seasonId || seasonId === 'S1' || localStorage.getItem('rankInheritedSeason') === seasonId) return;
    const rank = gameState.rank;
    const oldLabel = rankLabel();
    if (rank.tier >= 3) {
        const oldDivision = rank.division;
        rank.tier = Math.max(0, rank.tier - 3);
        rank.division = oldDivision || 1;
        rank.stars = 0;
    } else if (rank.tier > 0) {
        const oldStep = rank.tier * 3 + (3 - rank.division);
        const newStep = Math.max(0, oldStep - 3);
        rank.tier = Math.floor(newStep / 3);
        rank.division = 3 - (newStep % 3);
        rank.stars = 0;
    }
    localStorage.setItem('rankTier', rank.tier);
    localStorage.setItem('rankDivision', rank.division);
    localStorage.setItem('rankStars', rank.stars);
    localStorage.setItem('rankInheritedSeason', seasonId);
    localStorage.setItem('lastRankInheritance', JSON.stringify({ season:seasonId, from:oldLabel, to:rankLabel(), appliedAt:Date.now() }));
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
        inventory: JSON.parse(localStorage.getItem('inventory') || '{"renameCard":0,"rankStarCard":0,"rankProtectCard":0}')
    },
    player: null,
    enemies: [],
    allies: [],
    particles: [],
    skillEffects: [],
    killEffects: [],
    chests: [],
    obstacles: [],
    damageNumbers: [],
    teamObjectives: [],
    teamPowerAwarded: false,
    teamAngelTeam: null,
    teamDemonTeam: null,
    teamOvertime: false,
    teamOvertimeStartedAt: 0,
    teamEasterEgg: null,
    teamEasterEggTimer: 0,
    provokeActive: false,
    levelUpShown: false,  // 防止升级界面重复生成
    pendingLevelUpSkills: [], // 升级选项会随排位/爬塔存档保留
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
const EVOLUTION_RUN_SAVE_KEY = 'evolutionTrialRun';
let lastRankedSaveAt = 0;
let nextKillEffectId = 1;
let pendingSaveMode = null;

function spawnDamageNumber(target, amount, critical = false, source = '', combo = false) {
    if (!target || !Number.isFinite(amount)) return;
    // 同一个目标短时间内受到多次伤害时，依次占用不同的位置，避免数字完全重叠。
    const occupied = new Set(gameState.damageNumbers.filter(number => number.target === target && number.life > 0).map(number => number.slot));
    let slot = 0;
    while (occupied.has(slot) && slot < 14) slot++;
    const column = (slot % 5) - 2;
    const row = Math.floor(slot / 5);
    gameState.damageNumbers.push({
        target,
        slot,
        x: target.x + column * 18,
        y: target.y - target.radius - 8 - row * 20,
        amount: Math.max(0, Math.round(amount)),
        critical,
        source,
        combo,
        life: 42,
        maxLife: 42
    });
}

function spawnHealingNumber(target, amount) {
    const healed = Math.max(0, Math.round(amount || 0));
    if (healed > 0) spawnDamageNumber(target, healed, false, 'heal');
}

function runSaveKey(mode = gameState.mode) { return mode === 'ranked' ? RANKED_RUN_SAVE_KEY : mode === 'evolution' ? EVOLUTION_RUN_SAVE_KEY : TOWER_RUN_SAVE_KEY; }
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
function serializeParticle(particle) {
    return ['x','y','type','value','itemKey','vx','vy','life','maxLife','pickupDelay','isAmbient','chestReward','autoCollect'].reduce((data, field) => {
        data[field] = particle[field]; return data;
    }, {});
}
function restoreSavedParticles(savedParticles) {
    if (!Array.isArray(savedParticles)) return [];
    return savedParticles.map(saved => {
        if (!saved || !Number.isFinite(saved.x) || !Number.isFinite(saved.y)) return null;
        const particle = new Particle(saved.x, saved.y, saved.type, saved.value);
        ['itemKey','vx','vy','life','maxLife','pickupDelay','isAmbient','chestReward','autoCollect'].forEach(field => {
            if (saved[field] !== undefined) particle[field] = saved[field];
        });
        return particle;
    }).filter(Boolean);
}
function saveRankedRun() {
    const player = gameState.player;
    if (!['ranked','tower','evolution'].includes(gameState.mode) || !['playing','levelup'].includes(gameState.screen) || !player) return;
    const fields = ['x','y','level','exp','expToLevel','attack','defense','speed','maxHp','hp','skills','regenBonus','critChance','comboChance','lifesteal','skillPower','activeCooldownReduction','activeCooldown','empoweredHits','empoweredDamage','shieldHits','shieldReduction','evolved'];
    const playerState = { type: player.type };
    fields.forEach(field => { playerState[field] = player[field]; });
    localStorage.setItem(runSaveKey(), JSON.stringify({
        player: playerState,
        level: gameState.world.level,
        time: gameState.world.time,
        killCount: gameState.stats.killCount,
        skillRerolls: gameState.skillRerolls || 0,
        chestAvailable: gameState.world.level === 1 && gameState.chests.length > 0,
        chests: gameState.chests.map(chest => ({ x:chest.x, y:chest.y, radius:chest.radius, color:chest.color })),
        particles: gameState.particles.map(serializeParticle),
        provokeActive: !!gameState.provokeActive,
        enemies: gameState.enemies.map(serializeEnemy),
        awaitingLevelUp: gameState.screen === 'levelup',
        pendingLevelUpSkills: (gameState.pendingLevelUpSkills || []).map(skill => skill.name),
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
function settleAbandonedRun(mode) {
    const saved = getSavedRankedRun(mode);
    if (!saved) return chooseMode(mode);
    clearRankedRun(mode);
    if (!['ranked', 'evolution'].includes(mode)) return chooseMode(mode);
    gameState.mode = mode;
    gameState.player = new Character(saved.player.type);
    gameState.world.level = Math.max(1, saved.level || 1);
    gameState.stats.killCount = Math.max(0, saved.killCount || 0);
    gameState.screen = 'playing';
    finishRankedMatch(false);
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
function applyChameleonRemovalCompensation() {
    const compensation = 620;
    if (localStorage.getItem('chameleonRemovalCompensationV1')) return;
    // 删除旧英雄的残留记录，避免旧存档或图鉴缓存再出现变色龙。
    const unlocked = JSON.parse(localStorage.getItem('unlockedHeroes') || '[]').filter(key => key !== 'chameleon');
    localStorage.setItem('unlockedHeroes', JSON.stringify(unlocked));
    localStorage.removeItem('heroSkin:chameleon');
    [RANKED_RUN_SAVE_KEY, TOWER_RUN_SAVE_KEY, EVOLUTION_RUN_SAVE_KEY].forEach(key => {
        try { if (JSON.parse(localStorage.getItem(key) || 'null')?.player?.type === 'chameleon') localStorage.removeItem(key); } catch (_) { localStorage.removeItem(key); }
    });
    sendRewardMail('变色龙下架补偿', `变色龙已从英雄库移除。附件为它原商城售价的 ${compensation} 金币补偿，请手动领取。`, { coins: compensation });
    localStorage.setItem('chameleonRemovalCompensationV1', '1');
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
let nextCharacterId = 1;

// ============ 3D 渲染层 ============
// 3D 库异步加载；失败时保留原 Canvas 画面，保证游戏仍可游玩。
let render3DReady = false;
let Three, threeRenderer, threeScene, threeCamera, threeMeshes, threeLabels, threeNature, threeGround, threeGrid, threeOceanDecor, threePolarDecor, threeSkyDecor, threeForestDecor, threePondDecor, threeSavannaDecor;

function clearDynamic3DMeshes() {
    if (!threeMeshes) return;
    threeMeshes.forEach(mesh => threeScene?.remove(mesh));
    threeMeshes.clear();
    if (threeLabels) threeLabels.innerHTML = '';
}

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
            // 树与石头必须有足够空隙；找不到合适位置就少放一个，宁可稀疏也不堵路。
            let x = 0, z = 0, placed = false;
            for (let attempt = 0; attempt < 18; attempt++) {
                x = (Math.random() - .5) * 20; z = (Math.random() - .5) * 14;
                const worldX = x * 42 + GAME_WIDTH / 2, worldY = z * 42 + GAME_HEIGHT / 2;
                const radius = i % 3 === 0 ? 20 : 14;
                if (i % 3 === 2 || !(gameState.obstacles || []).some(obstacle => Math.hypot(worldX - obstacle.x, worldY - obstacle.y) < obstacle.radius + radius + 118)) { placed = true; break; }
            }
            if (!placed) continue;
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
        // 森林氛围：野花、蘑菇与发光萤火虫，只负责视觉，不阻挡移动。
        const forestDecor = new THREE.Group();
        const flowerColors = [0xffd3e3, 0xffdd6e, 0xa98cff];
        for (let i = 0; i < 56; i++) {
            const x = (Math.random() - .5) * 24, z = (Math.random() - .5) * 17;
            if (i % 3 === 0) {
                const stem = new THREE.Mesh(new THREE.CylinderGeometry(.014, .02, .22, 5), new THREE.MeshStandardMaterial({ color:0x397743, flatShading:true }));
                const bloom = new THREE.Mesh(new THREE.SphereGeometry(.08, 7, 6), new THREE.MeshStandardMaterial({ color:flowerColors[i % flowerColors.length], emissive:flowerColors[i % flowerColors.length], emissiveIntensity:.14, flatShading:true }));
                stem.position.set(x,.11,z); bloom.position.set(x,.25,z); forestDecor.add(stem,bloom);
            } else {
                const firefly = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 5), new THREE.MeshStandardMaterial({ color:0xfff28a, emissive:0xffca3a, emissiveIntensity:1.4 }));
                firefly.position.set(x,.4 + Math.random()*.8,z); firefly.userData.isFirefly=true; firefly.userData.phase=Math.random()*Math.PI*2;
                forestDecor.add(firefly);
            }
        }
        threeForestDecor = forestDecor;
        threeScene.add(forestDecor);
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
        // 极地场景：雪丘、浮冰、冰晶与飘雪。北极和南极共用这一套静谧冰原。
        const polarDecor = new THREE.Group();
        const iceMat = new THREE.MeshStandardMaterial({ color:0xc8f2ff, emissive:0x3b8aa5, emissiveIntensity:.12, roughness:.48, flatShading:true });
        const snowMat = new THREE.MeshStandardMaterial({ color:0xf5fbff, roughness:.92, flatShading:true });
        for (let i = 0; i < 30; i++) {
            const x = (Math.random() - .5) * 24, z = (Math.random() - .5) * 17;
            const ice = new THREE.Mesh(new THREE.DodecahedronGeometry(.18 + Math.random() * .32, 0), i % 3 ? iceMat : snowMat);
            ice.position.set(x,.12,z); ice.scale.y=.55; polarDecor.add(ice);
            if (i % 4 === 0) {
                const crystal = new THREE.Mesh(new THREE.ConeGeometry(.12,.72 + Math.random()*.4,5), iceMat);
                crystal.position.set(x+.18,.35,z-.12); polarDecor.add(crystal);
            }
        }
        for (let i = 0; i < 40; i++) {
            const snow = new THREE.Mesh(new THREE.SphereGeometry(.022 + Math.random()*.025, 6, 5), snowMat);
            snow.position.set((Math.random()-.5)*24,.3+Math.random()*2.7,(Math.random()-.5)*17);
            snow.userData.isSnow=true; snow.userData.snowSpeed=.008+Math.random()*.014; polarDecor.add(snow);
        }
        threePolarDecor = polarDecor;
        threeScene.add(polarDecor);
        // 天空场景：云海、浮岛与远处光环，让飞行英雄置身空中而不是草地。
        const skyDecor = new THREE.Group();
        const cloudMat = new THREE.MeshStandardMaterial({ color:0xf7fcff, emissive:0xcdeeff, emissiveIntensity:.2, roughness:.85, flatShading:true });
        const islandMat = new THREE.MeshStandardMaterial({ color:0x6b7d6b, roughness:.9, flatShading:true });
        for (let i=0;i<16;i++) {
            const x=(Math.random()-.5)*24,z=(Math.random()-.5)*17;
            if (i % 2 === 0) {
                [-.22,0,.24].forEach((offset, n) => { const cloud=new THREE.Mesh(new THREE.SphereGeometry(.28+n*.06,8,6),cloudMat); cloud.position.set(x+offset,.35+Math.random()*.3,z); cloud.scale.set(1.5,.55,1); skyDecor.add(cloud); });
            } else {
                const island=new THREE.Mesh(new THREE.ConeGeometry(.35,.5,6),islandMat); island.position.set(x,.2,z); island.rotation.x=Math.PI; skyDecor.add(island);
                const grass=new THREE.Mesh(new THREE.CylinderGeometry(.28,.33,.08,7),new THREE.MeshStandardMaterial({color:0x63a85c,flatShading:true})); grass.position.set(x,.46,z); skyDecor.add(grass);
            }
        }
        const skySun = new THREE.Mesh(new THREE.SphereGeometry(.72,12,8),new THREE.MeshStandardMaterial({color:0xffe08a,emissive:0xffb13b,emissiveIntensity:.65}));
        skySun.position.set(-8,2.6,-6); skyDecor.add(skySun);
        const rainbowMat = new THREE.MeshStandardMaterial({color:0xc1a8ff,emissive:0x7254bf,emissiveIntensity:.22,transparent:true,opacity:.7});
        const rainbow = new THREE.Mesh(new THREE.TorusGeometry(4.7,.06,6,32,Math.PI),rainbowMat); rainbow.rotation.x=Math.PI/2; rainbow.rotation.z=Math.PI; rainbow.position.set(2,1.4,5); skyDecor.add(rainbow);
        threeSkyDecor = skyDecor;
        threeScene.add(skyDecor);
        // 池塘场景：荷叶、芦苇、睡莲和波光，不产生碰撞。
        const pondDecor = new THREE.Group();
        const bankMat = new THREE.MeshStandardMaterial({ color:0xb99a62, roughness:.95, flatShading:true });
        const waterMat = new THREE.MeshStandardMaterial({ color:0x277f94, emissive:0x0b4558, emissiveIntensity:.32, roughness:.28, metalness:.18 });
        const bank = new THREE.Mesh(new THREE.CircleGeometry(8.8, 48), bankMat); bank.rotation.x=-Math.PI/2; bank.position.y=.012; pondDecor.add(bank);
        const water = new THREE.Mesh(new THREE.CircleGeometry(7.95, 48), waterMat); water.rotation.x=-Math.PI/2; water.position.y=.032; pondDecor.add(water);
        [2.1,4.25,6.2].forEach((radius, index) => { const ripple=new THREE.Mesh(new THREE.TorusGeometry(radius,.018,5,48),new THREE.MeshBasicMaterial({color:0xa9ebee,transparent:true,opacity:.25-index*.05})); ripple.rotation.x=-Math.PI/2; ripple.position.y=.052; pondDecor.add(ripple); });
        const reedMat = new THREE.MeshStandardMaterial({ color:0x426d35, roughness:.85, flatShading:true });
        const lilyMat = new THREE.MeshStandardMaterial({ color:0x4f9d52, roughness:.7, flatShading:true });
        const lilyFlowerMat = new THREE.MeshStandardMaterial({ color:0xffd3e9, emissive:0xa83c7b, emissiveIntensity:.22, roughness:.7, flatShading:true });
        const pondRockMat = new THREE.MeshStandardMaterial({ color:0x68716b, roughness:.95, flatShading:true });
        for (let i=0;i<34;i++) {
            const angle=Math.random()*Math.PI*2, radius=2.5+Math.random()*5.2, x=Math.cos(angle)*radius, z=Math.sin(angle)*radius;
            if (i%3===0) { const lily=new THREE.Mesh(new THREE.CircleGeometry(.16+Math.random()*.15,8),lilyMat); lily.rotation.x=-Math.PI/2; lily.position.set(x,.07,z); pondDecor.add(lily); if(i%2===0){ const bloom=new THREE.Mesh(new THREE.SphereGeometry(.075,7,6),lilyFlowerMat); bloom.position.set(x,.14,z); pondDecor.add(bloom); } }
            else if (i%3===1) for(let blade=-1;blade<=1;blade++){ const reed=new THREE.Mesh(new THREE.CylinderGeometry(.018,.028,.55+Math.random()*.38,5),reedMat); reed.position.set(x+blade*.05,.35,z); reed.rotation.z=blade*.18; pondDecor.add(reed); }
            else { const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.14+Math.random()*.16,0),pondRockMat); rock.position.set(x,.12,z); rock.scale.y=.55; pondDecor.add(rock); }
        }
        threePondDecor=pondDecor; threeScene.add(pondDecor);
        // 金色草原：金合欢树、干草簇和夕阳，所有景物仅作视觉装饰，不阻挡移动。
        const savannaDecor = new THREE.Group();
        const savannaTrunk = new THREE.MeshStandardMaterial({ color:0x69452d, roughness:.9, flatShading:true });
        const savannaLeaves = new THREE.MeshStandardMaterial({ color:0x5d7833, roughness:.86, flatShading:true });
        const dryGrass = new THREE.MeshStandardMaterial({ color:0xc89b45, roughness:.9, flatShading:true });
        [[-10,-6],[9,-5],[-9,6],[10,5],[-3,-7],[4,7]].forEach(([x,z], index) => {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,1.25,6), savannaTrunk);
            trunk.position.set(x,.62,z); savannaDecor.add(trunk);
            const branch = new THREE.Mesh(new THREE.CylinderGeometry(.055,.08,.7,5), savannaTrunk);
            branch.position.set(x+.18,1.12,z); branch.rotation.z=-.75; savannaDecor.add(branch);
            const crown = new THREE.Mesh(new THREE.SphereGeometry(.58 + (index % 2)*.1,8,6), savannaLeaves);
            crown.position.set(x+.12,1.43,z); crown.scale.set(1.85,.42,1.2); savannaDecor.add(crown);
        });
        for (let i=0;i<58;i++) {
            const x=(Math.random()-.5)*24, z=(Math.random()-.5)*17;
            const tuft = new THREE.Mesh(new THREE.ConeGeometry(.035,.25+Math.random()*.16,4), dryGrass);
            tuft.position.set(x,.13,z); savannaDecor.add(tuft);
        }
        const savannaSun = new THREE.Mesh(new THREE.SphereGeometry(.9,12,8),new THREE.MeshStandardMaterial({color:0xffce70,emissive:0xff9d31,emissiveIntensity:.72}));
        savannaSun.position.set(-9,2.5,-7); savannaDecor.add(savannaSun);
        threeSavannaDecor=savannaDecor; threeScene.add(savannaDecor);
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
    const polar = gameState.environment === 'polar';
    const pond = gameState.environment === 'pond';
    const savanna = gameState.environment === 'savanna';
    if (threeNature) threeNature.visible = !ocean && !sky && !polar && !pond && !savanna;
    if (threeForestDecor) threeForestDecor.visible = !ocean && !sky && !polar && !pond && !savanna;
    if (threeOceanDecor) threeOceanDecor.visible = ocean;
    if (threePolarDecor) threePolarDecor.visible = polar;
    if (threeSkyDecor) threeSkyDecor.visible = sky;
    if (threePondDecor) threePondDecor.visible = pond;
    if (threeSavannaDecor) threeSavannaDecor.visible = savanna;
    if (threeGrid) threeGrid.visible = !ocean && !sky && !polar && !pond && !savanna;
    if (threeGround) threeGround.material.color.setHex(ocean ? 0xbba76e : pond ? 0x2c6f73 : polar ? 0xe9f7ff : sky ? 0xa9d8fb : savanna ? 0xb99349 : 0x579c63);
    if (threeScene && Three) {
        const color = ocean ? 0x1d6f9d : pond ? 0x5fa8a8 : polar ? 0xaed8ed : sky ? 0x72b8ed : savanna ? 0xdfa45a : 0x87b9e8;
        threeScene.background = new Three.Color(color); threeScene.fog.color = new Three.Color(color);
    }
}

function toWorld(entity) { return { x: (entity.x - GAME_WIDTH / 2) / 42, z: (entity.y - GAME_HEIGHT / 2) / 42 }; }

function ensureSkinMotionTrail(mesh, entity) {
    const skinId = entity.skin?.id;
    if (!Three || !['moon', 'nebula', 'solar', 'starbloom'].includes(skinId) || mesh.userData.skinMotionTrail?.id === skinId) return;
    const palettes = {
        moon: [0x7651ff, 0xb46dff, 0xff76d5],
        nebula: [0x37d5ff, 0x7e5bff, 0xec66d6, 0x326cff],
        starbloom: [0x8ff0c7, 0xd1b1ff, 0xffe69b, 0xffffff],
        // 星穹狮王：底下的银河云由 galaxyClouds 保持蓝紫色，星芒本身全部白色。
        solar: [0xffffff]
    };
    // 星穹狮王采用紧凑星河与四角闪耀星，不使用圆泡泡或十字星。
    const makeTwinkleStar = (size, material) => {
        const shape = new Three.Shape();
        shape.moveTo(0, size * 2.1);
        shape.lineTo(size * .36, size * .36);
        shape.lineTo(size * 1.35, 0);
        shape.lineTo(size * .36, -size * .36);
        shape.lineTo(0, -size * 2.1);
        shape.lineTo(-size * .36, -size * .36);
        shape.lineTo(-size * 1.35, 0);
        shape.lineTo(-size * .36, size * .36);
        shape.closePath();
        const star = new Three.Mesh(new Three.ShapeGeometry(shape), material);
        star.rotation.x = -Math.PI / 2;
        return star;
    };
    const makePawPrint = (size, material) => {
        const paw = new Three.Group();
        const pad = new Three.Mesh(new Three.SphereGeometry(size * .82, 8, 6), material);
        pad.scale.set(1, .22, 1.18); paw.add(pad);
        [-.65, 0, .65].forEach((offset, index) => {
            const toe = new Three.Mesh(new Three.SphereGeometry(size * .34, 7, 5), material);
            toe.position.set(offset * size, .01, -.78 * size - (index === 1 ? .18 * size : 0));
            toe.scale.y = .24; paw.add(toe);
        });
        return paw;
    };
    const dustCount = skinId === 'solar' ? 34 : skinId === 'starbloom' ? 18 : 24;
    const dust = Array.from({ length: dustCount }, (_, index) => {
        const color = palettes[skinId][index % palettes[skinId].length];
        const size = (skinId === 'solar' ? .065 : skinId === 'starbloom' ? .075 : .052) + (index % 4) * (skinId === 'solar' ? .022 : .018);
        const trailMaterial = new Three.MeshBasicMaterial({ color, transparent:true, opacity:skinId === 'solar' ? .94 : .92, blending:skinId === 'solar' ? Three.NormalBlending : Three.AdditiveBlending, depthWrite:skinId === 'solar', side:skinId === 'solar' ? Three.DoubleSide : Three.FrontSide });
        // 星穹狮王不再使用圆润星点，而是和击败特效一致的十字星芒、星环与闪光。
        const part = skinId === 'solar' ? new Three.Group() : skinId === 'starbloom' ? makePawPrint(size, trailMaterial) : new Three.Mesh(new Three.IcosahedronGeometry(size, 1), trailMaterial);
        if (skinId === 'solar') {
            part.add(makeTwinkleStar(size, trailMaterial));
        }
        part.userData.trailMaterial = trailMaterial;
        part.userData.dustIndex = index;
        mesh.add(part);
        return part;
    });
    const glitters = palettes[skinId].concat(palettes[skinId]).map((color, index) => {
        const glitterMaterial = new Three.MeshBasicMaterial({ color, transparent:true, opacity:.9, blending:skinId === 'solar' ? Three.NormalBlending : Three.AdditiveBlending, depthWrite:skinId === 'solar', side:skinId === 'solar' ? Three.DoubleSide : Three.FrontSide });
        const glitterSize = .035 + (index % 3) * .012;
        const sparkle = ['solar','starbloom'].includes(skinId) ? new Three.Group() : new Three.Mesh(new Three.IcosahedronGeometry(glitterSize, 1), glitterMaterial);
        if (['solar','starbloom'].includes(skinId)) {
            sparkle.add(makeTwinkleStar(glitterSize, glitterMaterial));
        }
        sparkle.userData.glitterMaterial = glitterMaterial;
        sparkle.userData.glitterAngle = index / 10 * Math.PI * 2;
        mesh.add(sparkle);
        return sparkle;
    });
    const pathCloudSpecs = skinId === 'solar' ? [
        { color:0x07146b, x:0, z:1.18, scale:[1.48,1.48], turn:0, opacity:.26 },
        { color:0x16288f, x:0, z:1.18, scale:[1.48,1.48], turn:0, opacity:.24 },
        { color:0x3d258b, x:0, z:1.18, scale:[1.48,1.48], turn:0, opacity:.21 }
    ] : skinId === 'starbloom' ? [
        { color:0x1a7b68, x:-.12, z:1.22, scale:[.82,1.72], turn:0, opacity:.14 },
        { color:0x7652a6, x:.12, z:1.22, scale:[.82,1.72], turn:0, opacity:.13 },
        { color:0xe5bd68, x:0, z:1.22, scale:[.48,1.72], turn:0, opacity:.08 }
    ] : [];
    const galaxyClouds = pathCloudSpecs.map((spec, index) => {
        const cloud = new Three.Mesh(new Three.PlaneGeometry(1, 1), new Three.MeshBasicMaterial({ color:spec.color, transparent:true, opacity:spec.opacity, depthWrite:false, blending:Three.AdditiveBlending }));
        cloud.rotation.set(-Math.PI / 2, spec.turn, 0);
        cloud.position.set(spec.x, .13 + index * .012, spec.z);
        cloud.scale.set(spec.scale[0], spec.scale[1], 1);
        cloud.userData.galaxyIndex = index;
        cloud.userData.baseScale = spec.scale;
        cloud.userData.baseTurn = spec.turn;
        mesh.add(cloud);
        return cloud;
    });
    // 不使用线条：只留下深蓝、紫、粉与白色的星空闪点和星芒。
    const ribbons = [];
    mesh.userData.skinMotionTrail = { id:skinId, dust, glitters, galaxyClouds, ribbons };
}

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
    if (kind === 'objective') {
        const ringMat = new Three.MeshStandardMaterial({ color:0x8d91a4, emissive:0x2e3348, emissiveIntensity:.85, transparent:true, opacity:.78, roughness:.28 });
        const ring = new Three.Mesh(new Three.TorusGeometry(entity.radius / 44, .065, 8, 32), ringMat);
        ring.rotation.x = -Math.PI / 2; ring.position.y = .08; group.add(ring);
        const beacon = new Three.Mesh(new Three.CylinderGeometry(.07, .13, .72, 7), ringMat); beacon.position.y = .38; group.add(beacon);
        const light = new Three.PointLight(0xb9c7ff, 1.2, 4); light.position.y=.7; group.add(light);
        group.userData.objective = { ringMat, ring, light };
        threeScene.add(group); return group;
    }
    if (kind === 'easterEgg') {
        const flagMat = new Three.MeshStandardMaterial({ color:0xffd34d, emissive:0xa45b05, emissiveIntensity:1.25, roughness:.22 });
        const pole = new Three.Mesh(new Three.CylinderGeometry(.035, .035, .95, 6), flagMat); pole.position.y=.48; group.add(pole);
        const flag = new Three.Mesh(new Three.PlaneGeometry(.52, .34), flagMat); flag.position.set(.25,.74,0); group.add(flag);
        const star = new Three.Mesh(new Three.OctahedronGeometry(.16, 0), new Three.MeshBasicMaterial({ color:0xffffff })); star.position.y=1.02; group.add(star);
        const glow = new Three.PointLight(0xffd657, 2.2, 4.4); glow.position.y=.65; group.add(glow);
        group.userData.easterEgg = { flag, star, glow };
        threeScene.add(group); return group;
    }
    if (kind === 'kill') {
        // 击杀星爆：核心闪光、彩色星环和向外绽放的星尘。
        const core = new Three.Mesh(new Three.IcosahedronGeometry(.18, 1), new Three.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:1 }));
        core.position.y = .48; group.add(core);
        const glow = new Three.PointLight(0x91eaff, 2.7, 4.2); glow.position.y = .48; group.add(glow);
        [0x55dfff, 0x9677ff, 0xf38ee8, 0xffffff].forEach((color, index) => {
            const ring = new Three.Mesh(new Three.TorusGeometry(.22 + index * .1, .026, 5, 24, Math.PI * 1.5), new Three.MeshBasicMaterial({ color, transparent:true, opacity:.94 }));
            ring.position.y = .48; ring.rotation.set(Math.PI / 2, index * .7, index * .45); ring.userData.killRing = index; group.add(ring);
        });
        [0xffffff,0x8eeaff,0xb28aff,0xffa6e9,0x73adff,0xffffff,0xa8f5ff,0xe3b5ff,0x8eeaff,0xffffff].forEach((color, index) => {
            const spark = new Three.Group();
            const sparkMat = new Three.MeshBasicMaterial({ color, transparent:true, opacity:.98 });
            spark.add(new Three.Mesh(new Three.BoxGeometry(.026, .18 + (index % 2) * .1, .026), sparkMat));
            spark.add(new Three.Mesh(new Three.BoxGeometry(.18 + (index % 2) * .1, .026, .026), sparkMat));
            spark.userData.killSpark = index / 10 * Math.PI * 2;
            spark.userData.killDistance = .2 + (index % 3) * .07;
            group.add(spark);
        });
        // 星尘拖尾从爆点拉出，保证即使战斗节奏很快也能一眼看见。
        [0x68e5ff,0xc28cff,0xff9ee9,0xffffff,0x76a7ff,0xa7f7ff].forEach((color, index) => {
            const trail = new Three.Mesh(new Three.ConeGeometry(.075, .8 + (index % 2) * .18, 5), new Three.MeshBasicMaterial({ color, transparent:true, opacity:.9 }));
            trail.userData.killTrail = index / 6 * Math.PI * 2;
            trail.userData.killTrailOffset = index * .15;
            group.add(trail);
        });
        group.userData.killBurst = true;
        threeScene.add(group); return group;
    }
    if (kind === 'skill') {
        const skillMat = new Three.MeshStandardMaterial({ color: entity.color, emissive: entity.color, emissiveIntensity: 1.25, roughness: .25 });
        const skinId = entity.owner?.skin?.id;
        if (entity.effect === 'shield' || entity.effect === 'healShield') {
            // 护盾贴着英雄形成半透明护甲球，而不是仅在地面画一圈。
            const skinColor = entity.owner?.skin?.id !== 'default' ? skillEffectColor(entity.owner) : null;
            const shieldColor = skinColor || (entity.effect === 'healShield' ? 0xffb84d : 0x62cfff);
            const shellMat = new Three.MeshStandardMaterial({ color:shieldColor, emissive:shieldColor, emissiveIntensity:1.15, transparent:true, opacity:.24, roughness:.18, side:Three.DoubleSide });
            const edgeMat = new Three.MeshBasicMaterial({ color:shieldColor, transparent:true, opacity:.75, wireframe:true });
            const flyingOwner = ['eagle','owl','snowOwl','crane','phoenix','bat','parrot','falcon','albatross','hummingbird','swan','condor','pelican','flamingo','raven','pigeon','goose','cockatoo','kitebird'].includes(entity.owner?.type);
            const shieldY = flyingOwner ? .9 : .62;
            const shieldSize = flyingOwner ? .98 : .82;
            const shell = new Three.Mesh(new Three.SphereGeometry(shieldSize, 18, 12), shellMat); shell.position.y=shieldY; group.add(shell);
            const edges = new Three.Mesh(new Three.IcosahedronGeometry(shieldSize + .04, 2), edgeMat); edges.position.y=shieldY; group.add(edges);
        } else if (entity.effect === 'reflect') {
            // 刺猬反伤是贴身转动的荆棘甲：榴莲皮肤换成黄绿外壳和金色尖刺。
            const durian = entity.owner?.skin?.id === 'durian';
            const shellColor = durian ? 0x9ab43b : 0x214eaa;
            const thornColor = durian ? 0xe8c944 : 0x76a9ff;
            const shellMat = new Three.MeshStandardMaterial({ color:shellColor, emissive:shellColor, emissiveIntensity:1.05, transparent:true, opacity:.38, roughness:.3 });
            const thornMat = new Three.MeshStandardMaterial({ color:thornColor, emissive:thornColor, emissiveIntensity:1.35, roughness:.22, flatShading:true });
            const shell = new Three.Mesh(new Three.SphereGeometry(.74, 16, 12), shellMat); shell.position.y=.6; group.add(shell);
            const ring = new Three.Mesh(new Three.TorusGeometry(.76, .035, 6, 18), thornMat); ring.rotation.x=Math.PI/2; ring.position.y=.6; group.add(ring);
            for (let i=0; i<12; i++) {
                const angle=i/12*Math.PI*2;
                const spike=add(new Three.ConeGeometry(.105,.42,5), thornMat, Math.cos(angle)*.78, .62 + (i%2 ? .16 : -.12), Math.sin(angle)*.78);
                spike.rotation.z=-Math.PI/2; spike.rotation.y=-angle;
            }
        } else if (entity.effect === 'reflectBurst') {
            const burstMat = new Three.MeshStandardMaterial({ color:0x163f9d, emissive:0x2f78ff, emissiveIntensity:1.8, transparent:true, opacity:.78, roughness:.18 });
            const ring = new Three.Mesh(new Three.TorusGeometry(.55, .055, 6, 20), burstMat); ring.rotation.x=Math.PI/2; ring.position.y=.28; group.add(ring);
            for (let i=0; i<10; i++) {
                const angle=i/10*Math.PI*2;
                const spike=add(new Three.ConeGeometry(.07,.52,4), burstMat, Math.cos(angle)*.58, .34, Math.sin(angle)*.58);
                spike.rotation.z=-Math.PI/2; spike.rotation.y=-angle;
            }
        } else if (entity.effect === 'pull') {
            const vortexMat = new Three.MeshStandardMaterial({ color:0x3ac7ee, emissive:0x127caa, emissiveIntensity:1.6, transparent:true, opacity:.8, roughness:.2 });
            [1, .64, .32].forEach((scale, index) => {
                const ring = new Three.Mesh(new Three.TorusGeometry(entity.radius / 42 * scale, .045, 7, 24), vortexMat);
                ring.rotation.x = -Math.PI / 2; ring.position.y = .12 + index * .07; group.add(ring);
            });
        } else if (entity.kind === 'aura') {
            const ring = new Three.Mesh(new Three.TorusGeometry(entity.radius / 42, .055, 7, 16), skillMat);
            ring.rotation.x = -Math.PI / 2; ring.position.y = .09; group.add(ring);
        } else {
            add(new Three.IcosahedronGeometry(entity.radius / 55, 1), skillMat, 0, .42, 0);
        }
        // 专属技能核心：固定在技能本体上，不再把彩球挂在角色周围。
        if (skinId === 'solar') {
            // 传说星穹狮王：深空核心、星云光环与前冲的银河光波。
            const core = new Three.Mesh(new Three.SphereGeometry(.24, 14, 10), new Three.MeshStandardMaterial({ color:0xe9f8ff, emissive:0x5ccfff, emissiveIntensity:2.35, roughness:.15 }));
            core.position.y=.42; group.add(core);
            const solarLight = new Three.PointLight(0x6edcff, 2.5, 4.5); solarLight.position.y=.42; group.add(solarLight);
            [0x4c7dff, 0x55dfff, 0xa47bff, 0xf177e5, 0xffffff].forEach((color, index) => {
                const arc = new Three.Mesh(new Three.TorusGeometry(.28 + index * .065, .032, 5, 24, Math.PI * 1.36), new Three.MeshBasicMaterial({ color, transparent:true, opacity:.96 }));
                arc.position.y = .42; arc.rotation.set(Math.PI / 2, index * .68, index * .35); arc.userData.skinTrail = index / 5 * Math.PI * 2; arc.userData.ring = true; group.add(arc);
            });
            [0x4c7dff,0x55dfff,0xa47bff,0xf177e5,0xffffff,0x7b9dff,0x9b78ff].forEach((color,index) => {
                const angle = index / 7 * Math.PI * 2;
                const ray = new Three.Mesh(new Three.ConeGeometry(.055, .48, 5), new Three.MeshBasicMaterial({ color, transparent:true, opacity:.84 }));
                ray.position.set(Math.cos(angle) * .42, .42, Math.sin(angle) * .42);
                ray.quaternion.setFromUnitVectors(new Three.Vector3(0,1,0), new Three.Vector3(Math.cos(angle),0,Math.sin(angle)));
                ray.userData.solarRay = true; group.add(ray);
            });
            [0x4c7dff,0x55dfff,0xa47bff,0xf177e5,0xffffff,0x7b9dff,0x9b78ff,0xd9f7ff].forEach((color, index) => {
                const spark = new Three.Mesh(new Three.IcosahedronGeometry(.055 + (index % 3) * .016, 1), new Three.MeshBasicMaterial({ color }));
                spark.userData.skinTrail = index / 8 * Math.PI * 2; spark.userData.radius = .62 + (index % 2) * .17; group.add(spark);
            });
            // 十字星不是普通圆点：会在光波外缘一闪一闪，像星空中飞过的彗星碎屑。
            [0xffffff,0xa8eeff,0xe2bcff,0x86a7ff,0xffffff,0x9cf4ff].forEach((color, index) => {
                const sparkle = new Three.Group();
                const sparkleMat = new Three.MeshBasicMaterial({ color, transparent:true, opacity:.96 });
                const vertical = new Three.Mesh(new Three.BoxGeometry(.026, .22 + (index % 2) * .11, .026), sparkleMat);
                const horizontal = new Three.Mesh(new Three.BoxGeometry(.22 + (index % 2) * .11, .026, .026), sparkleMat);
                sparkle.add(vertical, horizontal);
                sparkle.userData.skinTrail = index / 6 * Math.PI * 2 + .2;
                sparkle.userData.radius = .82 + (index % 3) * .09;
                sparkle.userData.sparkle = true;
                group.add(sparkle);
            });
            group.userData.skinSkill = 'solar';
        } else if (skinId === 'nebula') {
            const ring = new Three.Mesh(new Three.TorusGeometry(.42, .045, 7, 24), new Three.MeshBasicMaterial({ color:0x55d9ff, transparent:true, opacity:.82 }));
            ring.position.y=.42; ring.rotation.x=Math.PI/2; ring.userData.skinTrail = 0; ring.userData.ring = true; group.add(ring);
            add(new Three.IcosahedronGeometry(.15, 1), new Three.MeshStandardMaterial({ color:0x6f4cff, emissive:0x9d6cff, emissiveIntensity:1.8 }), 0, .42, 0);
            [0x6f4cff,0x55d9ff,0xffa6ee,0xffffff,0x6f4cff].forEach((color,index) => {
                const star = new Three.Mesh(new Three.IcosahedronGeometry(.052, 1), new Three.MeshBasicMaterial({color}));
                star.userData.skinTrail = index / 5 * Math.PI * 2; star.userData.radius = .38 + index * .045; group.add(star);
            });
            group.userData.skinSkill = 'nebula';
        } else if (skinId === 'moon') {
            const crescent = new Three.Mesh(new Three.TorusGeometry(.35, .05, 6, 24, Math.PI * 1.55), new Three.MeshBasicMaterial({ color:0xd9ccff, transparent:true, opacity:.95 }));
            crescent.position.y=.42; crescent.rotation.set(Math.PI / 2, .45, .3); crescent.userData.skinTrail = 0; crescent.userData.ring = true; group.add(crescent);
            [0xd9ccff,0xb29aff,0xffffff,0xd9ccff].forEach((color,index) => {
                const star = new Three.Mesh(new Three.IcosahedronGeometry(.05, 1), new Three.MeshBasicMaterial({color}));
                star.userData.skinTrail = index / 4 * Math.PI * 2; star.userData.radius = .34 + index * .03; group.add(star);
            });
            group.userData.skinSkill = 'moon';
        } else if (skinId === 'starbloom') {
            const pathMat = new Three.MeshBasicMaterial({ color:0x8ff0c7, transparent:true, opacity:.9 });
            const ring = new Three.Mesh(new Three.TorusGeometry(.44,.045,7,24),pathMat);
            ring.position.y=.42; ring.rotation.x=Math.PI/2; ring.userData.skinTrail=0; ring.userData.ring=true; group.add(ring);
            [0x8ff0c7,0xd1b1ff,0xffe69b,0xffffff,0x8ff0c7].forEach((color,index) => {
                const paw = new Three.Group();
                const pawMat = new Three.MeshBasicMaterial({ color, transparent:true, opacity:.95 });
                const pad = new Three.Mesh(new Three.SphereGeometry(.065,7,5),pawMat); pad.scale.set(1,.36,1.18); paw.add(pad);
                [-.055,0,.055].forEach((x,toeIndex) => { const toe=new Three.Mesh(new Three.SphereGeometry(.025,6,5),pawMat); toe.position.set(x,.012,-.07-(toeIndex===1?.018:0)); toe.scale.y=.4; paw.add(toe); });
                paw.userData.skinTrail=index/5*Math.PI*2; paw.userData.radius=.38+index*.045; paw.userData.sparkle=true; group.add(paw);
            });
            const beacon=add(new Three.OctahedronGeometry(.14,0),new Three.MeshStandardMaterial({color:0xfff2a8,emissive:0x8ff0c7,emissiveIntensity:1.8}),0,.42,0);
            beacon.userData.skinTrail=.2; beacon.userData.radius=.12; beacon.userData.sparkle=true;
            group.userData.skinSkill='starbloom';
        }
        threeScene.add(group); return group;
    }

    if (kind !== 'particle' && entity.type === 'seal') {
        const fur = new Three.MeshStandardMaterial({ color:0x7e96a2, roughness:.82, flatShading:true });
        const belly = new Three.MeshStandardMaterial({ color:0xe5edf0, roughness:.8, flatShading:true });
        const spots = new Three.MeshStandardMaterial({ color:0x405966, roughness:.9, flatShading:true });
        const body = add(new Three.SphereGeometry(.43, 12, 8), fur, 0, .45, .12, 1.25, .68, 1.88);
        add(new Three.SphereGeometry(.31, 11, 8), fur, 0, .62, -.59, 1.05, .92, .95);
        add(new Three.SphereGeometry(.21, 10, 7), belly, 0, .42, -.78, 1.08, .52, .45);
        add(new Three.SphereGeometry(.045, 7, 6), dark, -.12, .72, -.86);
        add(new Three.SphereGeometry(.045, 7, 6), dark, .12, .72, -.86);
        add(new Three.SphereGeometry(.06, 7, 6), dark, 0, .60, -.93, 1.2, .5, .58);
        [[-.31,.64,.02],[.3,.55,.22],[-.2,.48,.48],[.2,.43,.62]].forEach(([x,y,z]) => add(new Three.SphereGeometry(.075, 7, 5), spots, x, y, z, 1.15, .35, 1));
        [-1, 1].forEach(side => {
            const flipper = add(new Three.ConeGeometry(.17, .58, 5), fur, side * .48, .35, -.02, .78, 1, 1);
            flipper.rotation.z = side * .86;
        });
        // 海豹明显分叉的后鳍尾巴，放在身体后方而不是藏在身体里面。
        [-1, 1].forEach(side => {
            const rearFlipper = add(new Three.ConeGeometry(.14, .48, 5), fur, side * .18, .39, 1.14, .75, 1, 1.1);
            rearFlipper.rotation.z = side * .5;
        });
        [-1, 1].forEach(side => {
            const whisker = add(new Three.CylinderGeometry(.008, .008, .26, 4), light, side * .14, .59, -.86);
            whisker.rotation.z = side * Math.PI / 2.7;
        });
        group.userData = { flying:false, swimming:true, wings:[], legs:[], body };
        threeScene.add(group); return group;
    }

    if (kind !== 'particle' && entity.type === 'puffin') {
        // 海鹦不是企鹅：短身、橙红蓝相间的大嘴，以及较短的翅膀。
        const black = new Three.MeshStandardMaterial({ color:0x172436, roughness:.8, flatShading:true });
        const white = new Three.MeshStandardMaterial({ color:0xf7f4e9, roughness:.8, flatShading:true });
        const orange = new Three.MeshStandardMaterial({ color:0xf28c28, roughness:.65, flatShading:true });
        const red = new Three.MeshStandardMaterial({ color:0xd74d38, roughness:.65, flatShading:true });
        const blue = new Three.MeshStandardMaterial({ color:0x4e83a7, roughness:.65, flatShading:true });
        const body = add(new Three.SphereGeometry(.39,11,8), black,0,.47,.08,1.02,1.15,.82);
        add(new Three.SphereGeometry(.28,10,7), white,0,.44,-.27,.86,1.02,.24);
        add(new Three.SphereGeometry(.26,10,7), black,0,.84,-.08,1,1,1);
        add(new Three.BoxGeometry(.42,.16,.30), orange,0,.82,-.42);
        add(new Three.BoxGeometry(.32,.06,.23), red,0,.91,-.45);
        add(new Three.BoxGeometry(.18,.05,.17), blue,0,.73,-.48);
        [-1,1].forEach(side => { const wing=add(new Three.ConeGeometry(.12,.36,4),black,side*.31,.54,.05); wing.rotation.z=side*.92; });
        [-1,1].forEach(side => add(new Three.BoxGeometry(.14,.05,.16),orange,side*.11,.09,-.06));
        group.userData={flying:false,swimming:true,wings:[],legs:[],body}; threeScene.add(group); return group;
    }

    if (kind !== 'particle' && ['penguin','emperorPenguin'].includes(entity.type)) {
        const black = new Three.MeshStandardMaterial({ color:0x202631, roughness:.8, flatShading:true });
        const white = new Three.MeshStandardMaterial({ color:0xf4f6f2, roughness:.8, flatShading:true });
        const orange = new Three.MeshStandardMaterial({ color:0xf3ad3a, roughness:.7, flatShading:true });
        const body = add(new Three.SphereGeometry(.4,11,8), black,0,.5,.05,.9,1.25,.78);
        add(new Three.SphereGeometry(.27,10,7), white,0,.46,-.31,.9,1.08,.22);
        add(new Three.SphereGeometry(.23,10,7), black,0,.91,-.08,1,1,1);
        const beak = add(new Three.ConeGeometry(.075,.26,4), orange,0,.84,-.31); beak.rotation.x=-Math.PI/2;
        [-1,1].forEach(side => { const wing=add(new Three.ConeGeometry(.13,.5,4),black,side*.33,.54,.04); wing.rotation.z=side*.9; });
        [-1,1].forEach(side => add(new Three.BoxGeometry(.16,.05,.19),orange,side*.12,.1,-.05));
        group.userData={flying:false,swimming:true,wings:[],legs:[],body}; threeScene.add(group); return group;
    }

    if (kind !== 'particle' && entity.type === 'walrus') {
        const hide = new Three.MeshStandardMaterial({ color:0x8f6c59, roughness:.88, flatShading:true });
        const ivory = new Three.MeshStandardMaterial({ color:0xf5ead1, roughness:.65, flatShading:true });
        const body = add(new Three.SphereGeometry(.46,12,8),hide,0,.46,.12,1.32,.78,1.75);
        add(new Three.SphereGeometry(.34,11,8),hide,0,.63,-.52,1.08,.9,.85);
        [-.14,.14].forEach(x => { const tusk=add(new Three.ConeGeometry(.055,.52,5),ivory,x,.36,-.82); tusk.rotation.x=Math.PI; });
        [-1,1].forEach(side => { const flipper=add(new Three.ConeGeometry(.17,.56,5),hide,side*.5,.34,.05); flipper.rotation.z=side*.86; });
        group.userData={flying:false,swimming:true,wings:[],legs:[],body}; threeScene.add(group); return group;
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
    if (kind !== 'particle' && entity.type === 'narwhal') {
        // 独角鲸：圆润鲸身、两片尾鳍、胸鳍，以及从额头伸出的长螺旋独角。
        const bodyMat = new Three.MeshStandardMaterial({ color:0xa8c9db, roughness:.72, flatShading:true });
        const bellyMat = new Three.MeshStandardMaterial({ color:0xeaf4f7, roughness:.7, flatShading:true });
        const hornMat = new Three.MeshStandardMaterial({ color:0xf2e6c9, emissive:0x403722, emissiveIntensity:.18, roughness:.45, flatShading:true });
        const body = add(new Three.SphereGeometry(.46,14,9), bodyMat,0,.52,.08,1.38,.78,2.05);
        add(new Three.SphereGeometry(.3,11,8), bellyMat,0,.39,-.1,1.25,.28,1.7);
        add(new Three.SphereGeometry(.055,7,6),dark,-.17,.66,-.78);
        add(new Three.SphereGeometry(.055,7,6),dark,.17,.66,-.78);
        [-1,1].forEach(side => { const flipper=add(new Three.ConeGeometry(.16,.6,5),bodyMat,side*.48,.42,-.02); flipper.rotation.z=side*.94; });
        [-1,1].forEach(side => { const fluke=add(new Three.SphereGeometry(.23,8,6),bodyMat,side*.2,.54,1.02,.9,.22,1.35); fluke.rotation.z=side*.38; });
        const horn=add(new Three.ConeGeometry(.095,1.18,7),hornMat,0,.72,-1.02); horn.rotation.x=-Math.PI/2;
        for (let i=0;i<5;i++) {
            const band=add(new Three.TorusGeometry(.102-i*.011,.012,5,8),new Three.MeshStandardMaterial({color:0x9b896a,roughness:.55}),0,.72,-.76-i*.19);
            band.rotation.x=Math.PI/2;
        }
        group.userData={flying:false,swimming:true,wings:[],legs:[],body}; threeScene.add(group); return group;
    }

    if (kind !== 'particle' && (OCEAN_TYPES.includes(entity.type) || entity.type === 'abyssSwordfish')) {
        const sharkBody = add(new Three.SphereGeometry(.42, 12, 8), material, 0, .53, .05, 1.5, .7, 2.25);
        add(new Three.SphereGeometry(.055, 7, 6), dark, -.16, .64, -.7);
        add(new Three.SphereGeometry(.055, 7, 6), dark, .16, .64, -.7);
        const belly = new Three.MeshStandardMaterial({ color: 0xdde6e8, roughness: .8, flatShading: true });
        add(new Three.SphereGeometry(.28, 10, 6), belly, 0, .38, -.05, 1.35, .25, 1.9);
        if (entity.type === 'abyssSwordfish') {
            const billMaterial = new Three.MeshStandardMaterial({ color:0x8ed8ef, emissive:0x123e68, emissiveIntensity:.32, roughness:.42, flatShading:true });
            const bill = add(new Three.ConeGeometry(.075, 1.15, 7), billMaterial, 0, .59, -.98);
            bill.rotation.x = -Math.PI / 2;
            if (entity.skin?.id === 'thunderTide') {
                const tideGlow = new Three.MeshStandardMaterial({ color:0x50bfff, emissive:0x267cff, emissiveIntensity:1.5, roughness:.18, transparent:true, opacity:.9 });
                [-.3, 0, .3].forEach((z, index) => add(new Three.BoxGeometry(.62 - index * .08, .045, .075), tideGlow, 0, .71, z));
                [-1, 1].forEach(side => add(new Three.OctahedronGeometry(.08, 0), tideGlow, side * .32, .73, -.44));
                const tideLight = new Three.PointLight(0x50bfff, 1.8, 3.2); tideLight.position.set(0,.75,-.05); group.add(tideLight);
            }
        }
        if (entity.type === 'orca') {
            // 虎鲸的醒目白色眼斑、侧腹白斑和白色腹部。
            add(new Three.SphereGeometry(.17, 9, 7), belly, -.27, .72, -.62, 1.25, .62, .22);
            add(new Three.SphereGeometry(.17, 9, 7), belly, .27, .72, -.62, 1.25, .62, .22);
            add(new Three.SphereGeometry(.22, 10, 7), belly, -.43, .56, -.18, .35, .72, 1.1);
            add(new Three.SphereGeometry(.22, 10, 7), belly, .43, .56, -.18, .35, .72, 1.1);
        }
        const fins = [];
        const fin = (x, y, z, scaleX, rotationZ = 0) => {
            const part = add(new Three.ConeGeometry(.18, .62, 4), material, x, y, z, scaleX, 1, 1);
            part.rotation.z = rotationZ; fins.push(part); return part;
        };
        fin(0, .95, .12, 1, 0); // 背鳍
        fin(-.48, .47, -.02, 1, -.95); fin(.48, .47, -.02, 1, .95); // 胸鳍
        const tail = new Three.Mesh(new Three.ConeGeometry(.34, .7, 4), material);
        tail.position.set(0, .54, .96); tail.rotation.x = Math.PI / 2; group.add(tail); fins.push(tail);
        // 神话「星海巨鲨」：深紫背部、蓝紫发光侧纹和星光鳍缘，贴着鲨鱼身体而不是漂浮彩球。
        if (entity.skin?.id === 'nebula') {
            const stripeMat = new Three.MeshStandardMaterial({ color:0x56d6ff, emissive:0x326eff, emissiveIntensity:1.4, roughness:.2, flatShading:true });
            [-.32, 0, .32].forEach(z => add(new Three.BoxGeometry(.52, .04, .07), stripeMat, 0, .65, z));
            [-1, 1].forEach(side => add(new Three.SphereGeometry(.065, 7, 6), stripeMat, side * .17, .67, -.72));
            const finGlow = add(new Three.ConeGeometry(.06,.45,5), stripeMat,0,1.02,.16); finGlow.rotation.x=-.18;
        }
        group.userData.flying = false;
        group.userData.swimming = true;
        group.userData.wings = [];
        group.userData.legs = [];
        group.userData.swimParts = fins;
        group.userData.body = sharkBody;
        threeScene.add(group);
        return group;
    }

    if (kind !== 'particle' && entity.type === 'crocodile') {
        const scaleMat = new Three.MeshStandardMaterial({ color:0x46683a, roughness:.88, flatShading:true });
        const bellyMat = new Three.MeshStandardMaterial({ color:0x9aa56e, roughness:.82, flatShading:true });
        const body = add(new Three.SphereGeometry(.42, 12, 8), scaleMat, 0, .36, .14, 1.22, .55, 2.05);
        add(new Three.SphereGeometry(.33, 11, 7), scaleMat, 0, .43, -.66, 1.1, .48, 1.15);
        add(new Three.BoxGeometry(.52, .17, .52), bellyMat, 0, .29, -1.03, 1, 1, 1);
        add(new Three.SphereGeometry(.047, 7, 6), dark, -.17, .59, -.94);
        add(new Three.SphereGeometry(.047, 7, 6), dark, .17, .59, -.94);
        [-.28, -.14, 0, .14, .28].forEach((x, index) => {
            const ridge = add(new Three.ConeGeometry(.075, .22 + (index % 2) * .06, 5), dark, x, .7, .05 + index * .24);
            ridge.rotation.x = Math.PI;
        });
        const tail = add(new Three.ConeGeometry(.28, 1.25, 5), scaleMat, 0, .36, 1.28, 1, 1, 1.25);
        tail.rotation.x = Math.PI / 2;
        const legs = [];
        [-1, 1].forEach(side => [-.34, .46].forEach(z => {
            const leg = add(new Three.CylinderGeometry(.085, .11, .26, 6), scaleMat, side * .38, .17, z);
            leg.rotation.z = side * .68;
            legs.push(leg);
        }));
        group.userData = { flying:false, swimming:false, wings:[], legs, body };
        threeScene.add(group); return group;
    }

    if (kind !== 'particle' && entity.type === 'hippo') {
        // 河马有厚重紫灰身体、张开的粉色大嘴和两颗明显的大板牙。
        const hide = new Three.MeshStandardMaterial({ color:0x76687e, roughness:.88, flatShading:true });
        const mouth = new Three.MeshStandardMaterial({ color:0xf27e9b, roughness:.72, flatShading:true });
        const ivory = new Three.MeshStandardMaterial({ color:0xf4e3bf, roughness:.58, flatShading:true });
        const darkMouth = new Three.MeshStandardMaterial({ color:0x6b2440, roughness:.8, flatShading:true });
        const body = add(new Three.SphereGeometry(.5,14,9), hide,0,.48,.12,1.42,.78,1.72);
        add(new Three.SphereGeometry(.44,13,8), hide,0,.57,-.55,1.32,.72,.9);
        add(new Three.SphereGeometry(.34,12,7), mouth,0,.43,-.9,1.22,.48,.26);
        add(new Three.SphereGeometry(.25,11,7), darkMouth,0,.5,-.94,1.18,.30,.14);
        [-.17,.17].forEach(x => {
            add(new Three.BoxGeometry(.09,.18,.10), ivory,x,.46,-1.03);
            add(new Three.SphereGeometry(.10,8,6), hide,x,.92,-.64);
            add(new Three.SphereGeometry(.035,6,5), new Three.MeshStandardMaterial({color:0x16131b}),x,.94,-.72);
        });
        [-1,1].forEach(side => add(new Three.SphereGeometry(.13,8,6),hide,side*.38,.98,-.38));
        const legs=[]; [-.36,.36].forEach(x => [-.38,.42].forEach(z => legs.push(add(new Three.CylinderGeometry(.1,.13,.24,7),hide,x,.17,z))));
        group.userData={flying:false,swimming:true,wings:[],legs,body}; threeScene.add(group); return group;
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
    const isPhoenixEvolution = type === 'phoenix' || entity.evolution?.name === '不死火凤凰';
    if (entity.evolution?.name === '九尾狐') {
        // 九条尾巴都从同一个尾根长出，再由内向外像花瓣一样舒展；尾身连续、带纹线，末端自然弯曲。
        const furMat = new Three.MeshStandardMaterial({ color:0xfff7fc, emissive:0x563152, emissiveIntensity:.12, roughness:.92, flatShading:false });
        const softFurMat = new Three.MeshStandardMaterial({ color:0xf3e5f1, emissive:0x8f4b80, emissiveIntensity:.2, roughness:1, flatShading:false });
        const tipMat = new Three.MeshStandardMaterial({ color:0xe45091, emissive:0x8a1649, emissiveIntensity:.48, roughness:.75, flatShading:false });
        for (let i = 0; i < 9; i++) {
            // 尾巴整体缩小，但把尾根略微前移，仍保持从身体自然生长出来的感觉。
            const tailGroup = new Three.Group();
            tailGroup.scale.setScalar(.8);
            tailGroup.position.set(0, .12 * size, .10 * size);
            const spread = (i - 4) / 4;
            const outer = Math.abs(spread);
            const root = new Three.Vector3(0, .55 * size, .47 * size);
            const mid = new Three.Vector3(spread * .50 * size, (.86 + (1 - outer) * .48) * size, (1.00 + outer * .18) * size);
            const end = new Three.Vector3(spread * 1.28 * size, (.72 + (1 - outer) * 1.04) * size, (1.58 + outer * .34) * size);
            const curlSide = spread === 0 ? (i % 2 ? 1 : -1) : Math.sign(spread);
            const curl = new Three.Vector3(end.x + curlSide * .36 * size, end.y + (.20 + outer * .14) * size, end.z + .12 * size);
            const curve = new Three.CatmullRomCurve3([root, mid, end, curl]);
            // 每条尾巴使用一整根连续的弯曲尾身，彻底取消会看成豆豆或断节的多段模型。
            const tail = new Three.Mesh(new Three.TubeGeometry(curve, 40, (.19 + (1 - outer) * .035) * size, 12, false), furMat);
            tailGroup.add(tail);
            // 顶部毛纹是一根贴着尾身的细曲线；最后一段变深粉并随尾尖向上弯钩。
            // 三条略微偏开的细软毛流，让轮廓看起来蓬松，而不是一根光滑塑料管。
            [-1, 0, 1].forEach((side, strandIndex) => {
                const points = curve.getPoints(26).map((point, pointIndex) => {
                    const t = pointIndex / 26;
                    return point.clone().add(new Three.Vector3(side * (.08 + t * .055) * size, (.09 + Math.sin(t * Math.PI) * .04) * size, side * .035 * size));
                });
                const strand = new Three.Mesh(new Three.TubeGeometry(new Three.CatmullRomCurve3(points), 26, (.052 - strandIndex * .004) * size, 7, false), softFurMat);
                tailGroup.add(strand);
            });
            // 尾尖使用短毛束收束成弯钩，不做硬直的粉色管线。
            const tipCurve = new Three.CatmullRomCurve3([curve.getPoint(.7), curve.getPoint(.88), curl]);
            tailGroup.add(new Three.Mesh(new Three.TubeGeometry(tipCurve, 14, .09 * size, 8, false), tipMat));
            [.18,.34,.52,.69,.83].forEach(t => {
                const point = curve.getPoint(t), tangent = curve.getTangent(t).normalize();
                [-1, 1].forEach(side => {
                    const tuft = new Three.Mesh(new Three.ConeGeometry((.07 + (1-t) * .04) * size, (.18 + (1-t) * .13) * size, 6), softFurMat);
                    tuft.position.copy(point).add(new Three.Vector3(side * .12 * size, .08 * size, 0));
                    tuft.quaternion.setFromUnitVectors(new Three.Vector3(0,1,0), tangent.clone().add(new Three.Vector3(side * .18,.16,0)).normalize());
                    tailGroup.add(tuft);
                });
            });
            group.add(tailGroup);
        }
    }
    if (['cat','fox','wolf','tiger','leopard','lion','dog','raccoon','squirrel'].includes(type)) { ear(-0.25); ear(0.25); if (!(type === 'fox' && entity.evolution?.name === '九尾狐')) add(new Three.ConeGeometry(0.1 * size, 0.4 * size, 6), material, 0, 0.33 * size, 0.7 * size).rotation.x = Math.PI / 2; }
    if (type === 'rabbit') { ear(-0.18, 0.6, 0.1); ear(0.18, 0.6, 0.1); }
    if (type === 'bear' || type === 'panda' || type === 'polarBear') { const earMat = type === 'polarBear' ? material : dark; add(new Three.SphereGeometry(0.15, 8, 6), earMat, -0.27 * size, 0.96 * size, 0); add(new Three.SphereGeometry(0.15, 8, 6), earMat, 0.27 * size, 0.96 * size, 0); }
    if (type === 'panda') { add(new Three.SphereGeometry(0.16, 8, 6), dark, -0.15 * size, 0.68 * size, -0.33 * size, 1.3, .8, .3); add(new Three.SphereGeometry(0.16, 8, 6), dark, 0.15 * size, 0.68 * size, -0.33 * size, 1.3, .8, .3); }
    if (['deer','seasonStag','giraffe','zebra','llama','goat'].includes(type)) { ear(-0.22); ear(0.22); [-0.17, 0.17].forEach(x => { const horn = add(new Three.CylinderGeometry(.025 * size, .04 * size, .5 * size, 5), dark, x * size, 1.23 * size, 0); horn.rotation.z = x * .35; }); }
    if (['elephant','africanElephant'].includes(type)) {
        const earScale = type === 'africanElephant' ? 1.55 : 1.2;
        add(new Three.SphereGeometry(.26, 8, 6), material, -.38 * size, .63 * size, -.04 * size, earScale, .62, .17);
        add(new Three.SphereGeometry(.26, 8, 6), material, .38 * size, .63 * size, -.04 * size, earScale, .62, .17);
        const trunk = add(new Three.CylinderGeometry(.09 * size, .12 * size, .62 * size, 7), material, 0, .36 * size, -.43 * size); trunk.rotation.x = .7;
        [-.16,.16].forEach(x => { const tusk=add(new Three.ConeGeometry(.055*size,.36*size,5),light,x*size,.47*size,-.43*size); tusk.rotation.x=-1.2; });
    }
    if (type === 'boar') { [-.16,.16].forEach(x => { const tusk=add(new Three.ConeGeometry(.06*size,.34*size,5),light,x*size,.44*size,-.42*size); tusk.rotation.x=-1.3; }); }
    if (type === 'hedgehog') {
        const isDurian = entity.skin?.id === 'durian';
        const isEvolved = !!entity.evolved;
        const quillMat = new Three.MeshStandardMaterial({ color:isEvolved ? 0xb77538 : isDurian ? 0x5f8b28 : 0x4a2c22, emissive:isEvolved ? 0x4a1707 : 0x000000, emissiveIntensity:isEvolved ? .65 : 0, roughness:.82, flatShading:true });
        const faceMat = new Three.MeshStandardMaterial({ color:isEvolved ? 0xe6b470 : isDurian ? 0xd2af50 : 0xc58d69, roughness:.78, flatShading:true });
        // 圆滚刺背、浅色小脸和分层刺毛，榴莲皮肤会变成黄绿外壳。
        add(new Three.SphereGeometry(.48, 11, 8), quillMat, 0,.55*size,.24*size,1.15*size,.9*size,1.18*size);
        add(new Three.SphereGeometry(.26, 9, 7), faceMat, 0,.56*size,-.36*size,1.05*size,.8*size,1.18*size);
        add(new Three.SphereGeometry(.07,7,6),dark,0,.5*size,-.62*size,1,.72,1.35);
        for (let row=0; row<(isEvolved ? 4 : 3); row++) for (let i=-3; i<=3; i++) {
            const spike=add(new Three.ConeGeometry((isEvolved ? .085 : isDurian ? .075 : .06)*size,(isEvolved ? .52 : isDurian ? .38 : .34)*size,5),quillMat,i*.105*size,(.76+row*.13)*size,(.06+row*.13)*size);
            spike.rotation.z=i*.12; spike.rotation.x=-.35+row*.2;
        }
        if (isEvolved) {
            const crownMat = new Three.MeshStandardMaterial({ color:0xffd45a, emissive:0x9a4b08, emissiveIntensity:.7, flatShading:true });
            [-.15, 0, .15].forEach(x => add(new Three.ConeGeometry(.07 * size, .28 * size, 5), crownMat, x * size, 1.46 * size, -.03 * size));
        }
    }
    if (type === 'monkey') { add(new Three.SphereGeometry(.13,8,6),material,-.3*size,.78*size,0); add(new Three.SphereGeometry(.13,8,6),material,.3*size,.78*size,0); const tail=add(new Three.TorusGeometry(.28*size,.045*size,6,10,Math.PI),material,0,.42*size,.55*size); tail.rotation.x=Math.PI/2; }
    if (type === 'otter') { const tail=add(new Three.ConeGeometry(.18*size,.65*size,5),material,0,.36*size,.65*size); tail.rotation.x=Math.PI/2; }
    if (type === 'kangaroo') {
        legs.forEach(leg => group.remove(leg)); legs.length = 0;
        const belly = new Three.MeshStandardMaterial({ color:0xe7bd86, roughness:.72, flatShading:true });
        [-1, 1].forEach(side => {
            const thigh = add(new Three.SphereGeometry(.21 * size, 8, 6), material, side * .23 * size, .31 * size, .24 * size, .88, 1.28, .88);
            const foot = add(new Three.SphereGeometry(.13 * size, 8, 6), dark, side * .23 * size, .09 * size, -.19 * size, 1.05, .42, 1.75);
            legs.push(thigh, foot);
        });
        add(new Three.SphereGeometry(.24 * size, 9, 7), belly, 0, .43 * size, -.38 * size, 1.12, .84, .48);
        const tail = add(new Three.ConeGeometry(.17 * size, 1.28 * size, 7), material, 0, .34 * size, .76 * size); tail.rotation.x = Math.PI / 2;
        ear(-.2, .5, .1); ear(.2, .5, .1);
    }
    if (type === 'squirrel') add(new Three.SphereGeometry(.3*size,9,7),material,0,.65*size,.58*size,.82,1.2,1.35);
    if (['deer','seasonStag','giraffe','zebra','llama','goat','elephant','africanElephant','hippo'].includes(type)) {
        const tail=add(new Three.CylinderGeometry(.028*size,.045*size,.52*size,5),material,0,.48*size,.64*size); tail.rotation.x=Math.PI/2;
        add(new Three.SphereGeometry(.07*size,7,5),dark,0,.43*size,.92*size);
    }
    if (['eagle','owl','snowOwl','crane','phoenix','falcon','albatross','hummingbird','swan','condor','pelican','flamingo','raven','pigeon','goose','cockatoo','kitebird'].includes(type)) { wing(-.48); wing(.48); add(new Three.ConeGeometry(.11*size,.35*size,4), isPhoenixEvolution ? new Three.MeshStandardMaterial({color:0xff5b2e,emissive:0x551100}) : new Three.MeshStandardMaterial({color:0xffcc4a}), 0,.62*size,-.44*size).rotation.x=-Math.PI/2; }
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
    if (type === 'shark' && entity.evolution?.name === '巨齿鲨') {
        // 巨齿鲨不只是放大：加厚深蓝身躯、巨型背鳍与张开的满口尖牙。
        const megaMat = new Three.MeshStandardMaterial({ color:0x183d58, emissive:0x071d30, emissiveIntensity:.5, roughness:.48, flatShading:true });
        const mouthMat = new Three.MeshStandardMaterial({ color:0x1b0d16, roughness:.7, flatShading:true });
        const toothMat = new Three.MeshStandardMaterial({ color:0xf8f1d9, emissive:0x665a38, emissiveIntensity:.3, roughness:.4, flatShading:true });
        add(new Three.SphereGeometry(.5 * size, 11, 8), megaMat, 0, .4 * size, .16 * size, 1.32, .86, 1.62);
        add(new Three.BoxGeometry(.5 * size, .15 * size, .08 * size), mouthMat, 0, .43 * size, -.52 * size, 1.3, 1, 1);
        for (let i = -3; i <= 3; i++) {
            const toothTop = add(new Three.ConeGeometry(.042 * size, .17 * size, 5), toothMat, i * .065 * size, .49 * size, -.58 * size); toothTop.rotation.x = Math.PI;
            add(new Three.ConeGeometry(.042 * size, .17 * size, 5), toothMat, i * .065 * size, .36 * size, -.58 * size);
        }
        const giantFin = add(new Three.ConeGeometry(.24 * size, .78 * size, 5), megaMat, 0, 1.02 * size, .25 * size); giantFin.rotation.x = -.18;
        [-1, 1].forEach(side => { const fin = add(new Three.ConeGeometry(.18 * size, .62 * size, 5), megaMat, side * .57 * size, .43 * size, .08 * size); fin.rotation.z = side * 1.25; });
    }
    if (type === 'shark' && entity.skin?.id === 'abyss') {
        // 深渊蓝鲨的皮肤增加发光蓝纹和荧光眼，避免只比默认鲨鱼深一点点。
        const abyssGlow = new Three.MeshStandardMaterial({ color:0x37bfff, emissive:0x126de0, emissiveIntensity:1.5, roughness:.22, flatShading:true });
        [-.18, .03, .24].forEach(z => add(new Three.BoxGeometry(.48 * size, .035 * size, .055 * size), abyssGlow, 0, .62 * size, z * size));
        [-.14, .14].forEach(x => add(new Three.SphereGeometry(.072 * size, 7, 6), abyssGlow, x * size, .7 * size, -.4 * size));
        const dorsalGlow = add(new Three.ConeGeometry(.09 * size, .5 * size, 5), abyssGlow, 0, .96 * size, .34 * size); dorsalGlow.rotation.x = -.18;
    }
    // 史诗「月影灵狐」：雪白胸口、耳尖、尾尖和一枚固定月牙，外观贴合狐狸本体。
    if (type === 'fox' && entity.skin?.id === 'moon') {
        const moonMat = new Three.MeshStandardMaterial({ color:0xe8e4ff, emissive:0x7b5cff, emissiveIntensity:.55, roughness:.35, flatShading:true });
        add(new Three.SphereGeometry(.21 * size, 9, 7), moonMat, 0, .45 * size, -.39 * size, 1.1, .84, .42);
        [-1, 1].forEach(side => add(new Three.ConeGeometry(.07 * size, .22 * size, 5), moonMat, side * .25 * size, 1.2 * size, -.02 * size));
        const tailTip = add(new Three.ConeGeometry(.14 * size, .35 * size, 6), moonMat, 0, .34 * size, .9 * size); tailTip.rotation.x=Math.PI/2;
        const crescent = new Three.Mesh(new Three.TorusGeometry(.18 * size,.035 * size,6,18,Math.PI*1.5), moonMat);
        crescent.position.set(.34 * size, 1.17 * size, .1 * size); crescent.rotation.y=.65; group.add(crescent);
    }
    // S1史诗「繁星花冠」：花冠、发光枝角与胸前足迹徽记共同表现“万兽启程”的引路者。
    if (type === 'seasonStag' && entity.skin?.id === 'starbloom') {
        const pathMat = new Three.MeshStandardMaterial({ color:0x8ff0c7, emissive:0x39a983, emissiveIntensity:1.15, roughness:.26, flatShading:true });
        const starMat = new Three.MeshStandardMaterial({ color:0xffe69b, emissive:0xd79932, emissiveIntensity:1.25, roughness:.2, flatShading:true });
        const bloomMat = new Three.MeshStandardMaterial({ color:0xd3b1ff, emissive:0x7f51b6, emissiveIntensity:.95, roughness:.3, flatShading:true });
        const crown = new Three.Mesh(new Three.TorusGeometry(.31 * size,.035 * size,6,22),pathMat);
        crown.rotation.x=Math.PI/2; crown.position.set(0,1.03 * size,-.02 * size); group.add(crown);
        [-.24,-.12,0,.12,.24].forEach((x,index) => {
            const blossom=add(new Three.OctahedronGeometry((index===2?.095:.072)*size,0),index%2?starMat:bloomMat,x*size,(1.08+Math.cos(index)*.05)*size,-.2*size);
            blossom.rotation.z=index*.55;
        });
        [-1,1].forEach(side => {
            const branch=add(new Three.CylinderGeometry(.025*size,.045*size,.62*size,6),pathMat,side*.19*size,1.28*size,.04*size);
            branch.rotation.z=side*.42;
            [-.12,.12].forEach((offset,index) => {
                const tine=add(new Three.ConeGeometry(.035*size,.25*size,5),index?starMat:pathMat,(side*.34+offset)*size,(1.42+index*.13)*size,.03*size);
                tine.rotation.z=side*(.38+index*.2);
            });
        });
        const pad=add(new Three.SphereGeometry(.085*size,8,6),pathMat,0,.55*size,-.43*size,1,.35,1.15);
        [-.085,0,.085].forEach((x,index) => add(new Three.SphereGeometry(.035*size,7,5),starMat,x*size,(.63+(index===1?.025:0))*size,-.45*size,1,.35,1));
        const guideLight = new Three.PointLight(0x9ff3cf, 1.65, 3.2); guideLight.position.set(0,1.12,0); group.add(guideLight);
    }
    // 传说「虹光狮王」：彩虹从鬃毛由暖到冷渐变，做成鬃毛本身而不是在身体外挂光圈。
    if (type === 'lion' && entity.skin?.id === 'solar') {
        const rainbow = [0xff4b6e,0xff9346,0xffd747,0xffe264,0xb65ee8,0x6f7dff];
        rainbow.forEach((color, index) => {
            const mat = new Three.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:1.15, roughness:.2 });
            const x = (index - (rainbow.length - 1) / 2) * .14 * size;
            const mane = add(new Three.ConeGeometry(.1 * size, .44 * size, 5), mat, x, 1.03 * size, .15 * size);
            mane.rotation.z = -x * .75;
        });
        const chestMat = new Three.MeshStandardMaterial({ color:0xffd57b, emissive:0xff7b56, emissiveIntensity:.3, roughness:.35 });
        add(new Three.SphereGeometry(.27 * size,10,7), chestMat,0,.46 * size,-.38 * size,1.15,.9,.36);
    }
    if (type === 'owl') { add(new Three.SphereGeometry(.16,8,6),light,-.15*size,.72*size,-.34*size); add(new Three.SphereGeometry(.16,8,6),light,.15*size,.72*size,-.34*size); }
    if (type === 'crane') { const neck=add(new Three.CylinderGeometry(.08*size,.12*size,.7*size,7),light,0,1.05*size,.08*size); neck.rotation.z=.18; }
    if (isPhoenixEvolution) { for(let i=-2;i<=2;i++){ const flame=add(new Three.ConeGeometry(.1*size,.55*size,5),new Three.MeshStandardMaterial({color:0xff5b2e,emissive:0xaa2200,emissiveIntensity:.6}),i*.12*size,1.1*size,.2*size); flame.rotation.z=i*.18; } }
    if (['goat','rhino','llama'].includes(type)) [-.16,.16].forEach(x => { const horn=add(new Three.ConeGeometry(.075*size,.38*size,5),light,x*size,1.12*size,-.03*size); horn.rotation.z=x*.55; });
    if (type === 'turtle') add(new Three.SphereGeometry(.42,10,7),new Three.MeshStandardMaterial({color:0x315f35,roughness:.8,flatShading:true}),0,.48*size,.23*size,1.15*size,.65*size,1.3*size);
    if (['bat','parrot'].includes(type)) { wing(-.48); wing(.48); }
    if (['shark','dolphin','crocodile'].includes(type)) { const fin=add(new Three.ConeGeometry(.16*size,.45*size,4),material,0,.78*size,.35*size); fin.rotation.x=-.2; }
    if (entity.isBoss) { const crown = add(new Three.ConeGeometry(.38 * size, .55 * size, 5), new Three.MeshStandardMaterial({ color: 0xffd54a, emissive: 0x775500 }), 0, 1.65 * size, 0); crown.rotation.y = Math.PI / 5; }
    group.userData.flying = ['eagle', 'owl', 'snowOwl', 'crane', 'phoenix', 'bat', 'parrot', 'falcon', 'albatross', 'hummingbird', 'swan', 'condor', 'pelican', 'raven', 'pigeon', 'goose', 'cockatoo', 'kitebird'].includes(type);
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
    if (threePolarDecor?.visible) {
        threePolarDecor.children.forEach(item => {
            if (!item.userData.isSnow) return;
            item.position.y -= item.userData.snowSpeed;
            if (item.position.y < .08) item.position.y = 3;
        });
    }
    if (threeForestDecor?.visible) {
        const time = performance.now() * .003;
        threeForestDecor.children.forEach(item => {
            if (!item.userData.isFirefly) return;
            item.material.emissiveIntensity = .5 + Math.sin(time + item.userData.phase) * .45;
            item.position.y += Math.sin(time + item.userData.phase) * .002;
        });
    }
    const active = new Set();
    const sync = (entity, kind, id) => {
        active.add(id);
        let mesh = threeMeshes.get(id);
        if (!mesh) { mesh = build3DMesh(entity, kind); mesh.userData.evolutionScale = entity.evolved ? 1.28 : 1; threeMeshes.set(id, mesh); }
        const evolutionScale = mesh.userData.evolutionScale || 1;
        const pos = toWorld(entity);
        const phase = performance.now() * 0.008 + entity.x * 0.03;
        const flying = mesh.userData.flying;
        const moving = Math.hypot(entity.vx || 0, entity.vy || 0) > .05;
        mesh.position.set(pos.x, flying ? .8 + Math.sin(phase) * .12 : moving ? Math.abs(Math.sin(phase * 2)) * .09 : 0, pos.z);
        if (kind === 'objective' && mesh.userData.objective) {
            const palette = entity.owner === 'blue' ? 0x2797ff : entity.owner === 'red' ? 0xff3e48 : 0x8d91a4;
            mesh.userData.objective.ringMat.color.setHex(palette);
            mesh.userData.objective.ringMat.emissive.setHex(palette);
            mesh.userData.objective.light.color.setHex(palette);
            mesh.userData.objective.ring.rotation.z += .018;
            mesh.userData.objective.ring.scale.setScalar(1 + Math.sin(phase * 1.8) * .05);
        }
        if (kind === 'easterEgg' && mesh.userData.easterEgg) {
            const egg = mesh.userData.easterEgg;
            egg.flag.rotation.y = Math.sin(phase * 1.7) * .18;
            egg.star.rotation.y += .08;
            egg.star.position.y = 1.02 + Math.sin(phase * 2.6) * .08;
            egg.glow.intensity = 1.6 + Math.sin(phase * 3) * .7;
        }
        // 地面英雄朝移动方向行走，不再原地持续旋转；掉落物保留旋转效果。
        if (kind === 'particle') mesh.rotation.y += 0.12;
        else if (Math.hypot(entity.vx || 0, entity.vy || 0) > 0.05) mesh.rotation.y = Math.atan2(entity.vx, entity.vy) + Math.PI;
        if (flying) mesh.userData.wings.forEach((wing, index) => { wing.rotation.z = (index ? 1 : -1) * (1.0 + Math.sin(phase * 2.5) * .5); });
    if (!flying && mesh.userData.legs) mesh.userData.legs.forEach((leg, index) => {
            leg.rotation.x = moving ? Math.sin(phase * 3 + (index % 2 ? Math.PI : 0)) * .65 : 0;
        });
        if (mesh.userData.swimming) {
            mesh.rotation.z = moving ? Math.sin(phase * 2.2) * .08 : 0;
            // 鱼尾和鱼鳍左右摆动，游动时会在身后持续吐出小气泡。
            (mesh.userData.swimParts || []).forEach((part, index) => {
                if (part.userData.baseSwimRotationZ === undefined) part.userData.baseSwimRotationZ = part.rotation.z;
                part.rotation.z = part.userData.baseSwimRotationZ + Math.sin(phase * 3.2 + index * 1.6) * .26;
            });
            if (!mesh.userData.swimBubbles) {
                const bubbleMat = new Three.MeshBasicMaterial({ color:0xcaf6ff, transparent:true, opacity:.72 });
                mesh.userData.swimBubbles = [-.12, .08, .2].map((offset, index) => {
                    const bubble = new Three.Mesh(new Three.SphereGeometry(.035 + index * .012, 7, 6), bubbleMat);
                    bubble.userData.offset = offset; mesh.add(bubble); return bubble;
                });
            }
            mesh.userData.swimBubbles.forEach((bubble, index) => {
                const rise = (phase * .18 + index * .42) % 1;
                bubble.position.set((index - 1) * .08, .28 + rise * .7, .62 + rise * .38);
                bubble.visible = moving || rise < .28;
            });
        }
        if (mesh.userData.skinOrbit) {
            const skinOrbit = mesh.userData.skinOrbit;
            skinOrbit.parts.forEach((part, index) => {
                if (part.userData.orbit === undefined) {
                    part.rotation.y += .025 + index * .004;
                    return;
                }
                const angle = phase * (skinOrbit.kind === 'rainbow' ? 1.6 : 1.15) + part.userData.orbit;
                part.position.x = Math.cos(angle) * part.userData.radius;
                part.position.z = Math.sin(angle) * part.userData.radius;
                part.position.y = part.userData.height + Math.sin(angle * 2 + index) * .08;
                part.rotation.y += .06;
            });
        }
        // 高品质皮肤的星尘尾迹：自然散落在动物身后，移动和停下都持续闪烁。
        ensureSkinMotionTrail(mesh, entity);
        if (mesh.userData.skinMotionTrail) {
            const trail = mesh.userData.skinMotionTrail;
            const solarBoost = trail.id === 'solar' ? 1.2 : 1;
            const dustColumns = trail.id === 'solar' ? 6 : 6;
            trail.dust.forEach((part, index) => {
                part.visible = true;
                const row = Math.floor(index / dustColumns), lane = index % dustColumns - (dustColumns - 1) / 2;
                const drift = phase * 1.25 + index * 1.7;
                if (trail.id === 'solar') {
                    const progress = index / Math.max(1, trail.dust.length - 1);
                    const scatter = ((index * 37) % 100) / 100 - .5;
                    part.position.set(scatter * (1.04 - progress * .28), .34 + Math.sin(phase * 3 + index * 1.7) * .12, .50 + progress * 1.25 + (moving ? .08 : 0));
                } else if (trail.id === 'starbloom') {
                    const progress = index / Math.max(1, trail.dust.length - 1);
                    const lane = index % 2 ? .2 : -.2;
                    part.position.set(lane, .075, .58 + progress * 1.72 + (moving ? .12 : 0));
                    part.rotation.y = index % 2 ? .16 : -.16;
                } else {
                    part.position.set(lane * .14 * solarBoost + Math.sin(drift) * .09 * solarBoost, .36 + Math.cos(drift * 1.4) * .18 * solarBoost + row * .06, .62 + row * .34 + (moving ? .16 : 0));
                }
                const pulse = trail.id === 'starbloom' ? .82 + (Math.sin(phase * 2.2 + index * 1.4) + 1) * .08 : (.65 + (Math.sin(phase * (trail.id === 'solar' ? 2 : 5) + index * 2.1) + 1) * .5) * (trail.id === 'solar' ? 1.18 : 1);
                part.scale.setScalar(pulse);
                part.userData.trailMaterial.opacity = trail.id === 'starbloom' ? .5 + pulse * .28 : trail.id === 'solar' ? .72 + Math.min(.22, pulse * .18) : .48 + Math.min(.45, pulse * .35);
                if (trail.id === 'solar') {
                    part.rotation.set(0, 0, index * .41);
                }
            });
            trail.galaxyClouds?.forEach((cloud, index) => {
                cloud.rotation.set(-Math.PI / 2, cloud.userData.baseTurn, 0);
                cloud.scale.set(cloud.userData.baseScale[0], cloud.userData.baseScale[1], 1);
                cloud.material.opacity = trail.id === 'starbloom' ? .1 + index * .025 : .21 + index * .025;
            });
            trail.glitters.forEach((sparkle, index) => {
                const angle = phase * 1.9 + sparkle.userData.glitterAngle;
                const radius = .34 + (index % 3) * .1;
                if (trail.id === 'solar') {
                    const progress = index / Math.max(1, trail.glitters.length - 1);
                    const scatter = ((index * 53) % 100) / 100 - .5;
                    sparkle.position.set(scatter * .95, .40 + Math.cos(index * 2.1) * .16, .55 + progress * 1.15);
                } else if (trail.id === 'starbloom') {
                    const progress = index / Math.max(1, trail.glitters.length - 1);
                    sparkle.position.set(Math.sin(index * 2.2) * .48, .28 + Math.cos(index * 1.7) * .11, .55 + progress * 1.38);
                } else sparkle.position.set(Math.cos(angle) * radius, .42 + Math.sin(angle * 1.7) * .24, Math.sin(angle) * radius);
                const twinkle = .45 + (Math.sin(phase * (trail.id === 'starbloom' ? 2.8 : trail.id === 'solar' ? 2.2 : 6) + index * 2.4) + 1) * .5;
                sparkle.scale.setScalar(twinkle);
                sparkle.userData.glitterMaterial.opacity = trail.id === 'solar' ? .62 + twinkle * .26 : .35 + twinkle * .5;
            });
        }
        // 爪击、啄击与冲撞都用短促的前探动作表现；Boss 咆哮时会明显放大。
        if (kind === 'kill' && mesh.userData.killBurst) {
            const progress = 1 - Math.max(0, entity.life) / entity.maxLife;
            mesh.rotation.y += .16;
            mesh.scale.setScalar(.55 + progress * 1.5);
            mesh.children.forEach((part, index) => {
                if (part.userData.killRing !== undefined) {
                    part.rotation.z += .12 + part.userData.killRing * .025;
                    part.scale.setScalar(1 + progress * .7);
                }
                if (part.userData.killSpark !== undefined) {
                    const angle = part.userData.killSpark + progress * .75;
                    const distance = part.userData.killDistance + progress * (.55 + (index % 3) * .12);
                    part.position.set(Math.cos(angle) * distance, .48 + progress * .6 + Math.sin(angle * 2) * .08, Math.sin(angle) * distance);
                    part.scale.setScalar(Math.max(.15, 1.25 - progress * .82));
                    part.rotation.z += .15;
                }
                if (part.userData.killTrail !== undefined) {
                    const angle = part.userData.killTrail + progress * .35;
                    const distance = .18 + progress * (.72 + part.userData.killTrailOffset);
                    part.position.set(Math.cos(angle) * distance, .45 + progress * .32, Math.sin(angle) * distance);
                    part.quaternion.setFromUnitVectors(new Three.Vector3(0, 1, 0), new Three.Vector3(Math.cos(angle), .22, Math.sin(angle)).normalize());
                    const trailScale = Math.max(.12, 1.25 - progress * .85);
                    part.scale.set(trailScale, trailScale * (1.2 + progress * .75), trailScale);
                }
            });
            return;
        }
        if (entity.attackFlash > 0) {
            const hit = Math.min(1, entity.attackFlash / 10);
            mesh.scale.setScalar(evolutionScale * (1 + (entity.bossRoar ? .34 : .06) * hit));
            mesh.position.z -= (entity.bossRoar ? .38 : .1) * hit;
        } else mesh.scale.setScalar(evolutionScale);
        if (kind === 'skill' && (entity.effect === 'reflect' || entity.effect === 'reflectBurst')) {
            const pulse = entity.effect === 'reflectBurst' ? 1 + Math.sin(phase * 3) * .16 : 1 + Math.sin(phase * 1.8) * .05;
            mesh.rotation.y += entity.effect === 'reflectBurst' ? .24 : .075;
            mesh.scale.setScalar(pulse);
        }
        if (kind === 'skill' && mesh.userData.skinSkill) {
            const speed = mesh.userData.skinSkill === 'solar' ? 3.4 : mesh.userData.skinSkill === 'nebula' ? 2.6 : 2.1;
            mesh.rotation.y += mesh.userData.skinSkill === 'solar' ? .13 : .08;
            mesh.scale.multiplyScalar(1 + Math.sin(phase * speed) * .012);
            mesh.children.forEach((part, index) => {
                if (part.userData.skinTrail === undefined) return;
                const angle = phase * speed + part.userData.skinTrail + index * .4;
                const radius = part.userData.radius || .46;
                if (part.userData.ring) {
                    part.rotation.z += .13 + index * .025;
                    part.scale.setScalar(1 + Math.sin(phase * speed + index) * .12);
                    return;
                }
                part.position.x = Math.cos(angle) * radius;
                part.position.z = Math.sin(angle) * radius;
                part.position.y = .42 + Math.sin(angle * 2) * .22;
                if (part.userData.sparkle) {
                    const twinkle = .65 + (Math.sin(phase * 7 + index * 2.1) + 1) * .42;
                    part.scale.setScalar(twinkle);
                    part.rotation.z += .12;
                }
            });
        }
    };
    if (gameState.screen === 'playing' && gameState.player) {
        sync(gameState.player, 'player', 'player');
        gameState.allies.forEach((ally, index) => sync(ally, 'ally', `ally-${index}-${ally.type}`));
        gameState.enemies.forEach(enemy => sync(enemy, 'enemy', `enemy-${enemy.id}`));
        (gameState.teamObjectives || []).filter(objective => objective.visible !== false).forEach(objective => sync(objective, 'objective', `objective-${objective.id}`));
        if (gameState.teamEasterEgg) sync(gameState.teamEasterEgg, 'easterEgg', 'team-easter-egg');
        gameState.particles.forEach(particle => sync(particle, 'particle', `particle-${particle.id}`));
        gameState.skillEffects.forEach((effect, index) => sync(effect, 'skill', `skill-${index}`));
        gameState.killEffects.forEach(effect => sync(effect, 'kill', `kill-${effect.id}`));
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
    // 玩家箭头单独按玩家当前位置绘制，不再依附动物模型，因此不会跑到敌人身上或消失。
    if (gameState.player) {
        const pos = toWorld(gameState.player);
        const point = new Three.Vector3(pos.x, 1.7, pos.z).project(threeCamera);
        if (point.z >= -1 && point.z <= 1) {
            const marker = document.createElement('div');
            marker.className = 'player-focus-marker'; marker.dataset.owner = 'player'; marker.textContent = '\u25bc';
            marker.style.left = `${(point.x * .5 + .5) * 100}%`;
            marker.style.top = `${(-point.y * .5 + .5) * 100}%`;
            threeLabels.appendChild(marker);
            const hp = document.createElement('div');
            hp.className = 'player-world-hp';
            hp.style.left = `${(point.x * .5 + .5) * 100}%`;
            hp.style.top = `${(-point.y * .5 + .5) * 100 + 3}%`;
            hp.innerHTML = `<span>${gameState.player.name} Lv.${gameState.player.level}</span><div><i style="width:${Math.max(0, Math.min(100, gameState.player.hp / gameState.player.maxHp * 100))}%"></i></div>`;
            threeLabels.appendChild(hp);
        }
    }
    // 叠在画面最上层的击杀闪光与拖尾：不依赖3D材质，任何场景都清晰可见。
    gameState.killEffects.forEach(effect => {
        const pos = toWorld(effect);
        const point = new Three.Vector3(pos.x, .62, pos.z).project(threeCamera);
        if (point.z < -1 || point.z > 1) return;
        const progress = 1 - Math.max(0, effect.life) / effect.maxLife;
        const flash = document.createElement('div');
        flash.className = 'kill-flash';
        flash.style.left = `${(point.x * .5 + .5) * 100}%`;
        flash.style.top = `${(-point.y * .5 + .5) * 100}%`;
        const size = 1.08 + Math.sin(Math.min(1, progress * 2.8) * Math.PI) * .65;
        flash.style.transform = `translate(-50%,-50%) scale(${size})`;
        flash.style.opacity = `${Math.max(0, 1 - Math.max(0, progress - .58) / .42)}`;
        const trailLength = 24 + progress * 64;
        flash.innerHTML = `<b>✦</b>${Array.from({ length: 8 }, (_, index) => `<i style="height:${trailLength * (index % 2 ? .7 : 1)}px;transform:rotate(${index * 45 + progress * 28}deg) translateY(-${progress * 12}px)"></i>`).join('')}`;
        threeLabels.appendChild(flash);
    });
    gameState.enemies.forEach(enemy => {
        const pos = toWorld(enemy);
        const point = new Three.Vector3(pos.x, enemy.isBoss ? 2.8 : 1.35, pos.z).project(threeCamera);
        if (point.z < -1 || point.z > 1) return;
        const label = document.createElement('div');
        label.className = `enemy-label${enemy.isBoss ? ' boss' : ''}`;
        label.style.left = `${(point.x * .5 + .5) * 100}%`;
        label.style.top = `${(-point.y * .5 + .5) * 100}%`;
        if (gameState.environment === 'polar') label.style.color = '#101820';
        const percent = Math.max(0, Math.min(100, enemy.hp / enemy.maxHp * 100));
        const foeState = gameState.mode === 'team' && enemy.hp <= 0 ? ` · 复活 ${Math.ceil((enemy.respawnTicks || 0) / TARGET_FPS)} 秒` : gameState.mode === 'team' && enemy.invulnerableTicks > 0 ? ' · 无敌' : '';
        const foePower = gameState.mode === 'team' && enemy.teamAngel ? ' · 😇天使' : gameState.mode === 'team' && enemy.teamDemon ? ' · 😈魔王' : '';
        const foeName = gameState.mode === 'team' ? `🔴 ${enemy.name}` : enemy.name;
        label.innerHTML = `<span>${enemy.isBoss ? '👑 ' : ''}Lv.${enemy.level} ${foeName}${foeState}${foePower}${enemy.lastActionText && enemy.attackFlash > 0 ? ` · ${enemy.lastActionText}` : ''}</span><div class="enemy-hp"><i style="width:${percent}%"></i></div>`;
        threeLabels.appendChild(label);
    });
    gameState.allies.forEach(ally => {
        const pos=toWorld(ally), point=new Three.Vector3(pos.x,1.35,pos.z).project(threeCamera);
        const label=document.createElement('div'); label.className='enemy-label'; label.style.left=`${(point.x*.5+.5)*100}%`; label.style.top=`${(-point.y*.5+.5)*100}%`;
        const allyState = ally.hp <= 0 ? ` · 复活 ${Math.ceil((ally.respawnTicks || 0) / TARGET_FPS)} 秒` : ally.invulnerableTicks > 0 ? ' · 无敌' : '';
        const allyPower = ally.teamAngel ? ' · 😇天使' : ally.teamDemon ? ' · 😈魔王' : '';
        label.innerHTML=`<span style="color:#8fd3ff">🔵 ${ally.name} · Lv.${ally.level}${allyState}${allyPower}</span><div class="enemy-hp"><i style="width:${Math.max(0,ally.hp/ally.maxHp*100)}%;background:#3599ff"></i></div>`; threeLabels.appendChild(label);
    });
    (gameState.teamObjectives || []).filter(objective => objective.visible !== false).forEach(objective => {
        const pos = toWorld(objective), point = new Three.Vector3(pos.x, .82, pos.z).project(threeCamera);
        if (point.z < -1 || point.z > 1) return;
        const label = document.createElement('div');
        label.className = 'enemy-label'; label.style.left = `${(point.x * .5 + .5) * 100}%`; label.style.top = `${(-point.y * .5 + .5) * 100}%`;
        const amount = Math.round(Math.abs(objective.progress));
        const side = objective.progress > 0 ? '蓝方' : objective.progress < 0 ? '红方' : '中立';
        const color = objective.progress > 0 ? '#2c9cff' : objective.progress < 0 ? '#ff5252' : '#e8edf7';
        label.innerHTML = `<span style="color:${color};font-size:14px">${objective.mark} · ${objective.label}</span><div style="font-size:11px;color:${color}">${side}侵略值 ${amount}%</div>`;
        threeLabels.appendChild(label);
    });
    if (gameState.teamEasterEgg) {
        const egg = gameState.teamEasterEgg, pos = toWorld(egg), point = new Three.Vector3(pos.x, 1.28, pos.z).project(threeCamera);
        if (point.z >= -1 && point.z <= 1) {
            const label = document.createElement('div'); label.className = 'enemy-label';
            label.style.left = `${(point.x * .5 + .5) * 100}%`; label.style.top = `${(-point.y * .5 + .5) * 100}%`;
            label.innerHTML = `<span style="color:#ffe486;font-size:14px">🎏 神秘战旗</span><div style="font-size:11px;color:#fff3bd">占领 ${Math.round(Math.abs(egg.progress))}% · ${Math.ceil(egg.life / TARGET_FPS)}秒</div>`;
            threeLabels.appendChild(label);
        }
    }
    // 宝箱奖励会显示明确的文字，和普通小经验点区分开。
    gameState.particles.filter(p => p.chestReward).forEach(particle => {
        const pos = toWorld(particle), point = new Three.Vector3(pos.x,.75,pos.z).project(threeCamera);
        if (point.z < -1 || point.z > 1) return;
        const label = document.createElement('div');
        label.className = 'enemy-label chest-reward';
        label.style.left = `${(point.x*.5+.5)*100}%`; label.style.top = `${(-point.y*.5+.5)*100}%`;
        const chestItem = particle.type === 'item' ? CHEST_ITEMS[particle.itemKey] : null;
        label.innerHTML = `<span>${chestItem ? `${chestItem.emoji} ${chestItem.name}` : `EXP+${particle.value}`}</span>`;
        threeLabels.appendChild(label);
    });
    gameState.damageNumbers.forEach(number => {
        const pos = toWorld(number);
        const point = new Three.Vector3(pos.x, 1.35, pos.z).project(threeCamera);
        if (point.z < -1 || point.z > 1) return;
        const label = document.createElement('div');
        label.className = `damage-number${number.critical ? ' critical' : ''}${number.combo ? ' combo-hit' : ''}${number.source === 'enemy' ? ' enemy-hit' : ''}${number.source === 'reflect' ? ' reflect-hit' : ''}${number.source === 'heal' ? ' heal-hit' : ''}`;
        label.style.left = `${(point.x * .5 + .5) * 100}%`;
        label.style.top = `${(-point.y * .5 + .5) * 100}%`;
        label.style.opacity = Math.max(0, number.life / number.maxLife);
        label.textContent = `${number.source === 'heal' ? '+' : '-'}${number.amount}`;
        threeLabels.appendChild(label);
    });
}

// ============ 角色类 ============
class Character {
    constructor(type, x = GAME_WIDTH / 2, y = GAME_HEIGHT / 2, useSkin = true) {
        const animalData = ANIMALS[type];
        this.id = nextCharacterId++;
        this.type = type;
        this.name = animalData.name;
        this.emoji = animalData.emoji;
        // 已购买的皮肤只属于玩家本人，AI 敌人永远使用默认外观。
        this.skin = useSkin ? getSelectedHeroSkin(type) : null;
        this.color = this.skin?.color || animalData.color;

        this.level = 1;
        this.exp = 0;
        this.expToLevel = this.calculateExpToLevel();

        this.attack = animalData.baseAttack;
        this.defense = animalData.baseDefense;
        this.speed = animalData.baseSpeed;
        this.maxHp = animalData.baseHp;
        this.hp = this.maxHp;
        this.poisonTicks = 0;
        this.poisonProgress = 0;

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
        this.comboChance = 0;
        this.reflectHits = 0;
        this.reflectRatio = 0;
        this.lifesteal = 0;
        this.skillPower = 0;
        this.activeCooldownReduction = 0;
        this.passiveAbility = ABILITIES[type].passive;
        this.activeAbility = ABILITIES[type].active;
        // 星穹狮王专属主动技：发射可见的星空光波，保留普通狮子原有技能不变。
        if (type === 'lion' && this.skin?.id === 'solar') {
            this.activeAbility = { name:'星穹光波', desc:'发射穿透战场的星空光波，造成攻击力 260% 伤害', effect:'empower', bonus:18, hits:1, damagePercent:260, cooldown:9 };
        }
        this.applyPassive();
    }

    calculateExpToLevel() {
        return Math.floor(50 * Math.pow(1.15, this.level - 1));
    }

    addExp(amount) {
        // 5V5 是纯团队战，不产生等级、经验或升级选择。
        if (gameState.mode === 'team') return false;
        // 新手实战只展示拾取、技能和战斗，不触发升级界面打断教学。
        if (gameState.mode === 'tutorial') {
            this.exp = Math.min(this.expToLevel - 1, this.exp + amount);
            return false;
        }
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
        tryEvolvePlayer(this);
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
            if (typeof bonus.crit === 'number') {
                const critRoom = Math.max(0, 1 - this.critChance);
                const appliedCrit = Math.min(critRoom, bonus.crit);
                this.critChance += appliedCrit;
                const overflowCrit = bonus.crit - appliedCrit;
                if (overflowCrit > 0) {
                    const attackGain = Math.max(1, Math.round(overflowCrit * 40));
                    this.attack += attackGain;
                    gameState.lastUpgradeNotice = `暴击率已满，溢出的 ${Math.round(overflowCrit * 100)}% 暴击率转为攻击 +${attackGain}`;
                }
            }
            if (typeof bonus.combo === 'number') {
                const comboRoom = Math.max(0, MAX_COMBO_CHANCE - this.comboChance);
                const appliedCombo = Math.min(comboRoom, bonus.combo);
                this.comboChance += appliedCombo;
                const overflowCombo = bonus.combo - appliedCombo;
                if (overflowCombo > 0) {
                    const hpGain = Math.max(1, Math.round(overflowCombo * 250));
                    this.maxHp += hpGain; this.hp = this.maxHp;
                    gameState.lastUpgradeNotice = `连击率已满，溢出的 ${Math.round(overflowCombo * 100)}% 连击率转为生命上限 +${hpGain}`;
                } else gameState.lastUpgradeNotice = `连击率 +${Math.round(appliedCombo * 100)}%，当前 ${Math.round(this.comboChance * 100)}%`;
            }
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
        if (active.effect === 'reflect') { this.reflectHits = active.hits || 4; this.reflectRatio = active.ratio || .5; }
        if (active.effect === 'ink') {
            this.speedBoostTicks = 180;
            gameState.enemies.forEach(enemy => { if (Math.hypot(enemy.x - this.x, enemy.y - this.y) < 250) enemy.slowTicks = 180; });
        }
        if (active.effect === 'poison') {
            gameState.enemies.forEach(enemy => { if (Math.hypot(enemy.x - this.x, enemy.y - this.y) < 230) { enemy.poisonTicks = 240; enemy.poisonSource = this; } });
        }
        if (active.effect === 'pull') {
            const radius = active.radius || 280;
            const damage = Math.ceil(this.attack * (active.damagePercent || 240) / 100 * (1 + this.skillPower));
            for (const enemy of [...gameState.enemies]) {
                const dx = enemy.x - this.x, dy = enemy.y - this.y;
                const distance = Math.hypot(dx, dy);
                if (distance > radius) continue;
                // 把猎物拉到巨齿鲨嘴前，再用一次百分比伤害结算，避免吸到地图外。
                const safeDistance = Math.max(this.radius + enemy.radius + 4, 44);
                enemy.x = this.x + dx / Math.max(distance, 1) * safeDistance;
                enemy.y = this.y + dy / Math.max(distance, 1) * safeDistance;
                const actualDamage = enemy.takeDamage(damage, this);
                spawnDamageNumber(enemy, actualDamage, false, 'player');
                enemy.attackFlash = 16;
                if (enemy.hp <= 0) defeatEnemyBySkill(enemy);
            }
        }

        spawnSkillEffect(this, active);
        const angelCooldown = this.teamAngel ? .20 : 0;
        this.activeCooldown = active.cooldown * Math.max(.1, 1 - this.activeCooldownReduction - angelCooldown) * TARGET_FPS;
        if (gameState.mode === 'tutorial' && gameState.tutorial && gameState.tutorial.step === 3) {
            const enemy = new Enemy('rabbit', this.x + 300, this.y);
            enemy.name = '训练小兔';
            enemy.maxHp = 20; enemy.hp = 20; enemy.attack = 2; enemy.defense = 0;
            gameState.enemies = [enemy];
            setTutorialStep(4);
        }
        return true;
    }

    takeDamage(damage, source = null) {
        // 团队战复活后的短暂无敌：伤害数字会显示 0，但不会扣除生命。
        if (this.invulnerableTicks > 0) return 0;
        let actualDamage = Math.max(1, damage - Math.floor(this.defense / 2));
        if (this.shieldHits > 0) {
            actualDamage = Math.max(1, Math.ceil(actualDamage * (1 - this.shieldReduction)));
            this.shieldHits--;
        }
        const hpBefore = this.hp;
        this.hp -= actualDamage;
        if (source === gameState.player && this !== gameState.player) {
            trackLimitedGiftProgress('damage', Math.min(actualDamage, Math.max(0, hpBefore)));
            if (hpBefore > 0 && this.hp <= 0) trackLimitedGiftProgress('kills', 1);
        }
        if (source && this.reflectHits > 0 && source.hp > 0) {
            this.reflectHits--;
            const reflected = Math.max(1, Math.ceil(actualDamage * this.reflectRatio));
            source.hp -= reflected;
            spawnDamageNumber(source, reflected, false, 'reflect');
            // 每次反伤都从刺猬身上炸出一圈尖刺，让命中反馈比单纯数字更清楚。
            spawnSkillEffect(this, { name:'反伤尖刺', effect:'reflectBurst' });
        }
        return actualDamage;
    }

    update(frameScale = 1) {
        // 移动
        const overtimeMoveBoost = gameState.mode === 'team' && gameState.teamOvertime
            ? 1.10 + Math.min(.20, Math.max(0, gameState.world.time - gameState.teamOvertimeStartedAt) / 180 * .20)
            : 1;
        this.x += this.vx * frameScale * overtimeMoveBoost;
        this.y += this.vy * frameScale * overtimeMoveBoost;

        // 边界检测
        this.x = Math.max(this.radius, Math.min(GAME_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(GAME_HEIGHT - this.radius, this.y));
        if (gameState.environment === 'land') {
            // 树和石头使用圆形碰撞：推回圆边并移除朝内的速度，角色会沿边缘滑动。
            let obstacleHits = 0, escapeX = 0, escapeY = 0;
            for (const obstacle of gameState.obstacles || []) {
                const minimumDistance = this.radius + obstacle.radius;
                let dx = this.x - obstacle.x, dy = this.y - obstacle.y;
                let distance = Math.hypot(dx, dy);
                if (distance >= minimumDistance) continue;
                if (distance < .001) { dx = this.vx || 1; dy = this.vy || 0; distance = Math.hypot(dx, dy) || 1; }
                const normalX = dx / distance, normalY = dy / distance;
                this.x = obstacle.x + normalX * minimumDistance;
                this.y = obstacle.y + normalY * minimumDistance;
                obstacleHits++;
                escapeX += normalX; escapeY += normalY;
                const inwardSpeed = this.vx * normalX + this.vy * normalY;
                if (inwardSpeed < 0) {
                    this.vx -= inwardSpeed * normalX;
                    this.vy -= inwardSpeed * normalY;
                }
                if (this.isEnemyAI) {
                    // AI 碰到树石时进入一段固定绕路期；找死模式也不会立刻把目标重置为玩家导致原地转圈。
                    const tangentX = -normalY, tangentY = normalX;
                    const toTargetX = (this.targetX || this.x) - this.x;
                    const toTargetY = (this.targetY || this.y) - this.y;
                    this.pathAttempts = (this.pathAttempts || 0) + 1;
                    const direction = ((tangentX * toTargetX + tangentY * toTargetY) >= 0 ? 1 : -1) * (this.pathAttempts % 2 ? 1 : -1);
                    this.targetX = Math.max(this.radius + 36, Math.min(GAME_WIDTH - this.radius - 36, this.x + tangentX * direction * 235 + normalX * 80));
                    this.targetY = Math.max(this.radius + 36, Math.min(GAME_HEIGHT - this.radius - 36, this.y + tangentY * direction * 235 + normalY * 80));
                    this.avoidTicks = 30;
                    this.pathDetourTicks = 105;
                }
            }
            // 两棵树或石头夹住时，单独沿一棵障碍物滑动会来回震荡；改为寻找横向出口并短暂强制绕开。
            if (this.isEnemyAI && obstacleHits >= 2) {
                let escapeLength = Math.hypot(escapeX, escapeY);
                if (escapeLength < .12) { escapeX = -this.vy || 1; escapeY = this.vx || 0; escapeLength = Math.hypot(escapeX, escapeY) || 1; }
                escapeX /= escapeLength; escapeY /= escapeLength;
                const tangentX = -escapeY, tangentY = escapeX;
                const towardTargetX = (this.targetX || this.x) - this.x, towardTargetY = (this.targetY || this.y) - this.y;
                const side = tangentX * towardTargetX + tangentY * towardTargetY >= 0 ? 1 : -1;
                this.targetX = Math.max(this.radius, Math.min(GAME_WIDTH - this.radius, this.x + (escapeX * .7 + tangentX * side) * 190));
                this.targetY = Math.max(this.radius, Math.min(GAME_HEIGHT - this.radius, this.y + (escapeY * .7 + tangentY * side) * 190));
                this.avoidTicks = 52;
            }
        }

        if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - frameScale);
        if (this.attackFlash > 0) this.attackFlash = Math.max(0, this.attackFlash - frameScale);
        if (this.bossSkillCooldown > 0) this.bossSkillCooldown = Math.max(0, this.bossSkillCooldown - frameScale);
        if (this.activeCooldown > 0) this.activeCooldown = Math.max(0, this.activeCooldown - frameScale);
        if (this.speedBoostTicks > 0) this.speedBoostTicks = Math.max(0, this.speedBoostTicks - frameScale);
        if (this.teamPowerTicks > 0) this.teamPowerTicks = Math.max(0, this.teamPowerTicks - frameScale);
        if (this.teamRallyTicks > 0) this.teamRallyTicks = Math.max(0, this.teamRallyTicks - frameScale);
        if (this.invulnerableTicks > 0) this.invulnerableTicks = Math.max(0, this.invulnerableTicks - frameScale);
        if (this.slowTicks > 0) this.slowTicks = Math.max(0, this.slowTicks - frameScale);
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
        super(type, x, y, false);
        this.targetX = x;
        this.targetY = y;
        this.changeDirectionTimer = Math.random() * 100 + 50;
        this.isEnemyAI = true;
        this.avoidTicks = 0;
        this.pathDetourTicks = 0;
        this.pathAttempts = 0;
    }

    update(frameScale = 1) {
        // Boss 会持续锁定玩家；普通敌人才保留随机巡逻行为。
        if (this.pathDetourTicks > 0) {
            this.pathDetourTicks = Math.max(0, this.pathDetourTicks - frameScale);
        } else if (this.avoidTicks > 0) {
            this.avoidTicks = Math.max(0, this.avoidTicks - frameScale);
        } else if (gameState.mode === 'team') {
            // 团队模式的目标由 updateTeamTargets 分配，不能再被随机巡逻覆盖。
        } else if ((this.isBoss || gameState.provokeActive) && gameState.player) {
            this.targetX = gameState.player.x;
            this.targetY = gameState.player.y;
        } else {
            this.changeDirectionTimer -= frameScale;
            if (this.changeDirectionTimer <= 0) {
                let targetX, targetY;
                for (let tries = 0; tries < 12; tries++) {
                    targetX = Math.random() * GAME_WIDTH; targetY = Math.random() * GAME_HEIGHT;
                    if (gameState.environment !== 'land' || !(gameState.obstacles || []).some(obstacle => Math.hypot(targetX - obstacle.x, targetY - obstacle.y) < obstacle.radius + 65)) break;
                }
                this.targetX = targetX;
                this.targetY = targetY;
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
            const speed = this.speed * (this.isBoss ? 0.42 : 0.3) * (this.slowTicks > 0 ? .45 : 1);
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
        this.type = type; // 'exp'、'heal' 或 'item'
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
        } else if (type === 'item') {
            this.radius = 17;
            this.emoji = '🎁';
            this.color = '#6d6cff';
        }
        
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2; // 向上飘
        this.life = 240; // 4 秒（以 60 FPS 为基准）
        this.maxLife = 240;
        this.pickupDelay = 28; // 先展示掉落动画，再允许拾取
    }

    update(frameScale = 1, player = null) {
        // 击杀和宝箱奖励会自动追踪玩家当前位置；地图经验点仍需主动靠近。
        if (this.pickupDelay > 0) {
            this.pickupDelay = Math.max(0, this.pickupDelay - frameScale);
        } else if (this.autoCollect && player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0) {
                // 每一帧重新朝玩家当前位置转向，角色拐弯时粒子也会立刻跟随。
                // 宝箱奖励使用较慢且清晰的追踪轨迹，避免刚出现就瞬间被吸收而看不见飞入效果。
                const speed = this.chestReward ? Math.min(12, 3 + distance * 0.055) : Math.min(18, 6 + distance * 0.08);
                const turn = 1 - Math.pow(0.55, frameScale);
                this.vx += ((dx / distance) * speed - this.vx) * turn;
                this.vy += ((dy / distance) * speed - this.vy) * turn;
            }
        }

        if (!this.isAmbient) {
            this.x += this.vx * frameScale;
            this.y += this.vy * frameScale;
            if (!this.autoCollect && !this.chestReward) this.vy += 0.08 * frameScale; // 宝箱奖励固定在宝箱周围
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
        const item = this.type === 'item' ? CHEST_ITEMS[this.itemKey] : null;
        const text = item ? `${this.chestReward ? '奖励 ' : ''}${item.name}` : this.type === 'exp' ? `${this.chestReward ? '奖励 ' : ''}XP+${this.value}` : `${this.chestReward ? '奖励 ' : ''}HP+${this.value}`;
        ctx.fillText(text, this.x, this.y + this.radius + 10);

        ctx.restore();
    }
}

// 主动技能在场上保留为可见实体：攻击类是飞行投射物，冲刺类是落点冲击，防护/治疗类是跟随英雄的光环。
class SkillEffect {
    constructor(owner, active) {
        this.owner = owner;
        this.x = owner.x;
        this.y = owner.y;
        this.color = skillEffectColor(owner);
        this.skinEffect = owner.skin?.id || 'default';
        this.rainbowSkin = this.skinEffect === 'solar';
        this.name = active.name;
        this.effect = active.effect;
        this.radius = 26;
        this.life = 48;
        this.hitEnemies = new Set();
        this.vx = 0;
        this.vy = 0;
        if (active.effect === 'empower') {
            this.kind = 'projectile'; this.radius = 20; this.life = 150;
            this.vx = owner.facing.x * 12; this.vy = owner.facing.y * 12;
            this.damage = Math.ceil(owner.attack * (active.damagePercent || 100) / 100 * (1 + owner.skillPower));
        } else if (active.effect === 'dash') {
            this.kind = 'charge'; this.radius = 42; this.life = Math.ceil(active.distance / 14) + 2;
            this.vx = owner.facing.x * 14; this.vy = owner.facing.y * 14;
            this.damage = Math.ceil(owner.attack * 1.35 * (1 + owner.skillPower));
        } else if (active.effect === 'pull') {
            this.kind = 'pull'; this.radius = active.radius || 280; this.life = 34; this.damage = 0;
            this.color = '#3ac7ee';
        } else if (active.effect === 'reflect') {
            this.kind = 'aura'; this.radius = 56; this.life = 420; this.damage = 0;
            this.color = owner.skin?.id === 'durian' ? '#c7d84a' : '#4d82ff';
        } else if (active.effect === 'reflectBurst') {
            this.kind = 'reflectBurst'; this.radius = 22; this.maxRadius = 105; this.life = 24; this.damage = 0;
            this.color = '#1b4fb4';
        } else {
            this.kind = 'aura'; this.radius = active.effect === 'grow' ? 62 : 48; this.life = 75;
            this.damage = 0;
        }
        // 极地的雪景很亮，所有会造成伤害的实体改成黑色，飞行轨迹更容易辨认。
        if (gameState.environment === 'polar' && this.damage > 0) this.color = '#111820';
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
        } else if (this.kind === 'aura' || this.kind === 'reflectBurst' || this.kind === 'pull') {
            this.x = this.owner.x; this.y = this.owner.y;
        }
        if (this.effect === 'reflect' && this.owner.reflectHits <= 0) this.life = 0;
        if (this.kind === 'reflectBurst') this.radius = Math.min(this.maxRadius, this.radius + 4.5 * frameScale);
        this.life -= frameScale;
    }

    draw(ctx) {
        ctx.save();
        const alpha = Math.max(0, Math.min(1, this.life / 35));
        ctx.globalAlpha = alpha;
        const hue = (performance.now() / 4) % 360;
        ctx.strokeStyle = this.rainbowSkin ? `hsl(${hue} 95% 60%)` : this.color;
        ctx.fillStyle = this.rainbowSkin ? `hsl(${(hue + 42) % 360} 95% 60%)` : this.color;
        if (['solar','nebula','moon'].includes(this.skinEffect)) {
            const colors = this.rainbowSkin ? [0,52,105,166,222,282,325] : this.skinEffect === 'nebula' ? [258,195,306,0] : [260,286,220];
            colors.forEach((offset, index) => {
                const angle = performance.now() / 300 + index / colors.length * Math.PI * 2;
                const radius = this.radius * (.58 + (index % 2) * .18);
                ctx.fillStyle = `hsl(${(hue + offset) % 360} 95% 72%)`;
                ctx.beginPath(); ctx.arc(this.x + Math.cos(angle) * radius, this.y + Math.sin(angle) * radius, 3 + index % 2, 0, Math.PI * 2); ctx.fill();
            });
            ctx.strokeStyle = this.rainbowSkin ? `hsl(${hue} 95% 60%)` : this.color;
        }
        if (this.skinEffect === 'solar') {
            // 2D 备用画面同样保留彩虹太阳与七色光芒，避免低性能设备看不到传说特效。
            ctx.globalCompositeOperation = 'lighter';
            for (let i=0; i<7; i++) {
                const angle = performance.now() / 220 + i / 7 * Math.PI * 2;
                ctx.strokeStyle = ['#6f8cff','#62e5ff','#c491ff','#ff8ae9','#ffffff','#7aa8ff','#9ef3ff'][i];
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(this.x + Math.cos(angle) * this.radius * .32, this.y + Math.sin(angle) * this.radius * .32);
                ctx.lineTo(this.x + Math.cos(angle) * this.radius * 1.18, this.y + Math.sin(angle) * this.radius * 1.18);
                ctx.stroke();
            }
            const glow = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.radius * .72);
            glow.addColorStop(0, '#ffffff'); glow.addColorStop(.42, 'rgba(105,222,255,.78)'); glow.addColorStop(.72, 'rgba(172,116,255,.38)'); glow.addColorStop(1, 'rgba(90,86,255,0)');
            ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * .72, 0, Math.PI * 2); ctx.fill();
            for (let i=0; i<6; i++) {
                const angle = performance.now() / 170 + i / 6 * Math.PI * 2;
                const distance = this.radius * (.84 + (i % 2) * .18);
                const x = this.x + Math.cos(angle) * distance, y = this.y + Math.sin(angle) * distance;
                const glowSize = 3 + (Math.sin(performance.now() / 90 + i) + 1) * 2;
                ctx.strokeStyle = i % 2 ? '#a8eeff' : '#fff'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(x-glowSize,y); ctx.lineTo(x+glowSize,y); ctx.moveTo(x,y-glowSize); ctx.lineTo(x,y+glowSize); ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over';
        } else if (this.skinEffect === 'starbloom') {
            // 低性能设备也能看到“万兽启程”：固定青绿/紫金色的足迹沿技能方向亮起。
            const facingAngle = Math.atan2(this.owner.facing?.y || 0, this.owner.facing?.x || 1);
            ['#8ff0c7','#d1b1ff','#ffe69b','#ffffff'].forEach((color,index) => {
                const distance = this.radius * (.35 + index * .23);
                const side = index % 2 ? 7 : -7;
                const x = this.x + Math.cos(facingAngle) * distance + Math.cos(facingAngle + Math.PI/2) * side;
                const y = this.y + Math.sin(facingAngle) * distance + Math.sin(facingAngle + Math.PI/2) * side;
                ctx.fillStyle=color;
                ctx.beginPath(); ctx.ellipse(x,y,4.5,6.5,facingAngle,0,Math.PI*2); ctx.fill();
                [-1,0,1].forEach(toe => { ctx.beginPath(); ctx.arc(x + Math.cos(facingAngle + Math.PI/2) * toe * 4 + Math.cos(facingAngle) * 6, y + Math.sin(facingAngle + Math.PI/2) * toe * 4 + Math.sin(facingAngle) * 6, 2, 0, Math.PI*2); ctx.fill(); });
            });
        }
        ctx.lineWidth = 4;
        if (this.effect === 'reflect') {
            const durian = this.owner.skin?.id === 'durian';
            const spin = performance.now() * .008;
            ctx.lineWidth = 5;
            ctx.strokeStyle = this.color;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = durian ? '#f2d14c' : '#88b6ff';
            for (let i=0; i<12; i++) {
                const angle = spin + i / 12 * Math.PI * 2;
                const x = this.x + Math.cos(angle) * this.radius;
                const y = this.y + Math.sin(angle) * this.radius;
                ctx.save(); ctx.translate(x,y); ctx.rotate(angle + Math.PI/2);
                ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(7,8); ctx.lineTo(-7,8); ctx.closePath(); ctx.fill(); ctx.restore();
            }
        } else if (this.kind === 'reflectBurst') {
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#16439e';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = '#377eff';
            for (let i=0; i<10; i++) {
                const angle = i / 10 * Math.PI * 2;
                const x = this.x + Math.cos(angle) * this.radius;
                const y = this.y + Math.sin(angle) * this.radius;
                ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x + Math.cos(angle-.35)*12,y + Math.sin(angle-.35)*12); ctx.lineTo(x + Math.cos(angle+.35)*12,y + Math.sin(angle+.35)*12); ctx.closePath(); ctx.fill();
            }
        } else if (this.kind === 'pull') {
            const pulse = 1 - this.life / 34;
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#49dbff';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * (1 - pulse * .38), 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * .48 * (1 - pulse * .45), 0, Math.PI * 2); ctx.stroke();
        } else if (this.kind === 'aura') {
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

function spawnKillEffect(x, y, killer = gameState.player) {
    const skinId = killer?.skin?.id;
    const supported = (killer?.type === 'lion' && skinId === 'solar') || (killer?.type === 'shark' && skinId === 'nebula') || (killer?.type === 'fox' && skinId === 'moon') || (killer?.type === 'seasonStag' && skinId === 'starbloom');
    if (!supported) return;
    const color = skinId === 'starbloom' ? '#8ff0c7' : skinId === 'moon' ? '#d7b8ff' : skinId === 'nebula' ? '#8a75ff' : '#8eeaff';
    gameState.killEffects.push({ id: nextKillEffectId++, x, y, life: 72, maxLife: 72, color, skinId });
}

function updateKillEffects(frameScale = 1) {
    for (let i = gameState.killEffects.length - 1; i >= 0; i--) {
        gameState.killEffects[i].life -= frameScale;
        if (gameState.killEffects[i].life <= 0) gameState.killEffects.splice(i, 1);
    }
}

function defeatEnemyBySkill(enemy) {
    const player = gameState.player;
    const index = gameState.enemies.indexOf(enemy);
    if (!player || index < 0) return;
    // 团队战不会永久移除英雄；技能击败后同样进入 3 秒复活倒计时。
    if (gameState.mode === 'team') {
        markTeamDefeated(enemy);
        return;
    }
    spawnKillEffect(enemy.x, enemy.y);
    if (gameState.mode !== 'skinTrial') {
        gameState.stats.killCount++;
        trackBattlePassKill();
        gameState.stats.coins += Math.ceil((enemy.isBoss ? 80 : 12) * (isFridayEvolution() ? 1.5 : 1));
        localStorage.setItem('coins', gameState.stats.coins);
        player.addExp(Math.floor(10 * (1 + enemy.level * 0.5)));
        spawnParticles(enemy.x, enemy.y, 5);
    }
    gameState.enemies.splice(index, 1);
    if (gameState.enemies.length !== 0) return;
    if (gameState.mode === 'tutorial') return completeTutorialBattle();
    if (gameState.mode === 'skinTrial') return queueSkinTrialOpponent();
    if (gameState.mode === 'team') return finishRankedMatch(true);
    if (isRankProgressMode()) {
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
                    const actualDamage = enemy.takeDamage(effect.damage, effect.owner);
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
    if ((attacker.teamPowerTicks || 0) > 0) damage = Math.ceil(damage * 1.25);
    if ((attacker.teamRallyTicks || 0) > 0) damage = Math.ceil(damage * 1.15);
    if (gameState.mode === 'team' && gameState.teamOvertime) {
        const overtimeDamageBoost = 1.10 + Math.min(.20, Math.max(0, gameState.world.time - gameState.teamOvertimeStartedAt) / 180 * .20);
        damage = Math.ceil(damage * overtimeDamageBoost);
    }
    const canUseBossSkill = attacker.isBoss && attacker.bossSkillCooldown <= 0;
    if (canUseBossSkill) {
        damage = Math.ceil(damage * 2.25 + 8);
        attacker.bossSkillCooldown = 7 * TARGET_FPS;
        attacker.bossRoar = true;
        attacker.lastActionText = attacker.bossSkillName || '王者猛击';
    } else attacker.bossRoar = false;
    const source = attacker === gameState.player ? 'player' : 'enemy';
    const actualDamage = defender.takeDamage(damage, attacker);
    spawnDamageNumber(defender, actualDamage, attacker.lastCritical, source);
    let comboHits = 0;
    while (attacker.hp > 0 && defender.hp > 0 && Math.random() < Math.min(MAX_COMBO_CHANCE, attacker.comboChance || 0) && comboHits < 5) {
        comboHits++;
        const comboDamage = rollBattleDamage(attacker);
        const comboActual = defender.takeDamage(comboDamage, attacker);
        spawnDamageNumber(defender, comboActual, attacker.lastCritical, source, true);
    }
    if (attacker.lifesteal > 0) {
        const hpBeforeLifesteal = attacker.hp;
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.ceil(damage * attacker.lifesteal));
        spawnHealingNumber(attacker, attacker.hp - hpBeforeLifesteal);
    }
    attacker.cooldown = Math.max(18, 42 - attacker.speed * 2);
    attacker.attackFlash = canUseBossSkill ? 18 : 10;
    if (attacker === gameState.player || defender === gameState.player) gameState.player.lastCombatTime = gameState.world.time;
    if (gameState.mode === 'team' && defender.hp <= 0) markTeamDefeated(defender);
    return defender.hp <= 0;
}

function spawnAmbientPickups(count = 32) {
    for (let i = 0; i < count; i++) {
        let x = 40 + Math.random() * (GAME_WIDTH - 80);
        let y = 40 + Math.random() * (GAME_HEIGHT - 80);
        const blocked = gameState.environment === 'land' && (gameState.obstacles || []).some(obstacle => Math.hypot(x - obstacle.x, y - obstacle.y) < obstacle.radius + 46);
        if (Math.hypot(x - gameState.player.x, y - gameState.player.y) < 110 || blocked) { i--; continue; }
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
    // 宝箱主要掉经验，并额外给 1 个会立即生效的战斗道具；不再掉 HP 球。
    for (let i = 0; i < 14; i++) {
        const type = i < 13 ? 'exp' : 'item';
        const value = type === 'exp' ? 12 + Math.floor(Math.random() * 4) * 6 : null;
        const particle = new Particle(x, y, type, value);
        if (type === 'item') {
            const keys = Object.keys(CHEST_ITEMS);
            particle.itemKey = keys[Math.floor(Math.random() * keys.length)];
            const item = CHEST_ITEMS[particle.itemKey];
            particle.emoji = item.emoji;
            particle.color = item.color;
            particle.radius = 17;
        }
        const angle = (Math.PI * 2 * i) / 14 + (Math.random() - .5) * .35;
        const distance = 46 + (i % 2) * 7;
        particle.x += Math.cos(angle) * distance;
        particle.y += Math.sin(angle) * distance;
        // 直接摆成一圈，不再向远处飞散。
        particle.vx = 0;
        particle.vy = 0;
        // 先在宝箱旁展示一小段时间，再像击杀掉落一样追踪飞入玩家。
        particle.pickupDelay = 42;
        particle.chestReward = true;
        particle.autoCollect = true;
        particle.life = 900;
        particle.maxLife = 900;
        gameState.particles.push(particle);
    }
}

function activateChestItem(itemKey) {
    const player = gameState.player;
    const item = CHEST_ITEMS[itemKey];
    if (!player || !item) return;
    if (itemKey === 'magnet') {
        player.magnetTicks = Math.max(player.magnetTicks || 0, 12 * TARGET_FPS);
    } else if (itemKey === 'expScroll') {
        player.addExp(100);
    } else if (itemKey === 'battleTonic') {
        if (!player.battleTonicTicks || player.battleTonicTicks <= 0) player.attack += 8;
        player.battleTonicTicks = Math.max(player.battleTonicTicks || 0, 15 * TARGET_FPS);
    }
    window.setTimeout(() => { if (gameState.screen === 'playing') window.alert(`获得道具：${item.emoji} ${item.name}\n${item.desc}`); }, 0);
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
    applyChameleonRemovalCompensation();
    checkUnlocks();
    // 登录时检查赛季日期；跨入新赛季会立即重置战令并执行一次段位继承。
    battlePassState();
    rebalancePendingPolarRewards();
    grantEligiblePolarRewards();
    gameState.screen = 'hall';
    if (!localStorage.getItem('tutorialComplete')) {
        const useMobile = window.confirm('新手教程：你使用手机玩吗？\n确定：手机摇杆\n取消：电脑键盘');
        setControlMode(useMobile ? 'mobile' : 'desktop');
        startTutorialBattle();
        return;
    }
    showHall();
}

const TUTORIAL_STEPS = [
    '先移动一下。熟悉方向后，你就能自由探索场景并躲开障碍物。',
    '跟着箭头吃掉经验点：获得经验的同时会回复 1 点生命。',
    '靠近宝箱打开它：经验与战斗道具会先围在宝箱旁，再自动飞进你身上。',
    '先阅读技能介绍：被动技能会自动生效；主动技能可造成伤害、治疗或防护。关闭介绍后，点击右侧技能按钮（电脑也可按空格）实际释放一次。技能进入冷却时暂时不能重复使用。',
    '最后击败训练小兔。接触敌人会自动攻击；你造成的伤害是黑色、暴击是红色，敌人造成的伤害是黄色。脱战 5 秒后会逐渐加速回血。排位、爬塔和进化试炼中，右侧“找死”可以让全部敌人主动来战。'
];

function tutorialTargetPercent(target, height = 1.1) {
    if (!target) return null;
    if (render3DReady && threeCamera) {
        const pos = toWorld(target);
        const point = new Three.Vector3(pos.x, height, pos.z).project(threeCamera);
        if (point.z >= -1 && point.z <= 1) return { x:(point.x * .5 + .5) * 100, y:(-point.y * .5 + .5) * 100 };
    }
    return { x:target.x / GAME_WIDTH * 100, y:target.y / GAME_HEIGHT * 100 };
}

function setTutorialStep(step) {
    const tutorial = gameState.tutorial;
    if (!tutorial) return;
    tutorial.step = step;
    const coach = document.getElementById('tutorialCoach');
    const hint = document.getElementById('tutorialHint');
    const arrow = document.getElementById('tutorialArrow');
    let x = 50, y = 49, direction = '⬇';
    const target = step === 0 ? gameState.player
        : step === 1 ? gameState.particles.find(particle => particle.isAmbient)
        : step === 2 ? gameState.chests.find(chest => chest.tutorialChest)
        : step === 4 ? gameState.enemies[0]
        : null;
    const targetPosition = tutorialTargetPercent(target, step === 2 ? .6 : 1.1);
    if (targetPosition) { x = targetPosition.x; y = targetPosition.y; }
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
            ? '新手试炼 1/5：拖动左下角的摇杆，让小猫先走起来。'
            : '新手试炼 1/5：按 WASD 或方向键，让小猫先走起来。')
        : `新手试炼 ${step + 1}/5：${TUTORIAL_STEPS[step]}`;
    coach.style.display = 'block';
    if (step === 3 && !tutorial.skillInfoShown) {
        tutorial.skillInfoShown = true;
        // 首次进入技能步骤自动弹出详情，确保新玩家看得到被动、主动与冷却说明。
        openSkillInfo();
    }
}

function refreshTutorialCoachPosition() {
    const tutorial = gameState.tutorial;
    if (!tutorial || tutorial.step === 3) return;
    const target = tutorial.step === 0 ? gameState.player
        : tutorial.step === 1 ? gameState.particles.find(particle => particle.isAmbient)
        : tutorial.step === 2 ? gameState.chests.find(chest => chest.tutorialChest)
        : tutorial.step === 4 ? gameState.enemies[0]
        : null;
    const position = tutorialTargetPercent(target, tutorial.step === 2 ? .6 : 1.1);
    if (!position) return;
    const coach = document.getElementById('tutorialCoach');
    coach.style.left = `${position.x}%`; coach.style.top = `${position.y}%`;
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
    gameState.killEffects = [];
    gameState.chests = [];
    // 刻意留出少量生命缺口，让新玩家能立刻看见经验点的 +1 回复。
    player.hp = Math.max(1, player.maxHp - 4);
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
    document.getElementById('tutorialText').textContent = '欢迎来到大厅！上方可以查看账号等级和金币；中间可选择爬塔、排位爬塔、5v5 团队模式与进化试炼。下方的英雄、背包、商城、英雄之路、皮肤图鉴、邮件与反馈可用于管理账号、查看奖励、收集皮肤和提交建议。每日宝箱与签到奖励也会在大厅显示。';
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
    gameState.killEffects = [];
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
    document.getElementById('tutorialText').textContent = '新手试炼完成！你已经学会移动、拾取、开宝箱、使用技能和战斗。以后升级时可从不同品质技能中选择强化；排位、爬塔和进化试炼右侧还有“找死”开关，可让全部敌人主动来战，再按一次即可取消。';
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

function nextLockedPolarHero() {
    const pending = new Set(getMails().filter(mail => !mail.claimed && mail.rewards?.hero).map(mail => mail.rewards.hero));
    for (const key of POLAR_REWARD_ORDER) {
        if (!ANIMALS[key].unlocked && !pending.has(key)) return key;
    }
    return null;
}

function sendPolarHeroReward(title) {
    const hero = nextLockedPolarHero();
    if (!hero) return;
    sendRewardMail(title, `恭喜达成目标！北极英雄 ${ANIMALS[hero].name} 已送到邮件附件，请手动领取。`, { hero });
}
function polarUnlockCondition(key) {
    const rankIndex = POLAR_RANK_REWARDS.indexOf(key);
    if (rankIndex >= 0) return `段位达到 ${RANK_TIERS[rankIndex + 1]} 时邮件领取`;
    const levelIndex = POLAR_LEVEL_REWARDS.indexOf(key);
    if (levelIndex >= 0) return `账号达到 Lv.${(levelIndex + 1) * 5} 时邮件领取`;
    return '英雄之路奖励领取';
}
function sendSpecificPolarHeroReward(title, hero) {
    const pending = getMails().some(mail => !mail.claimed && mail.rewards?.hero === hero);
    if (!hero || ANIMALS[hero].unlocked || pending) return;
    const mails = getMails();
    mails.unshift({ title, content:`恭喜达成目标！北极英雄 ${ANIMALS[hero].name} 已送到邮件附件，请手动领取。`, rewards:{ hero }, system:true, read:false, claimed:false, polarFixed:true });
    saveMails(mails);
}

function rebalancePendingPolarRewards() {
    const mails = getMails();
    const unlocked = new Set(Object.keys(ANIMALS).filter(key => ANIMALS[key].unlocked));
    const pendingPolarMails = mails.filter(mail => !mail.claimed && !mail.polarFixed && POLAR_TYPES.includes(mail.rewards?.hero));
    let orderIndex = 0;
    // 邮件数组最新在前，倒序处理可让最早达成的奖励优先取得史诗英雄。
    [...pendingPolarMails].reverse().forEach(mail => {
        while (orderIndex < POLAR_REWARD_ORDER.length && unlocked.has(POLAR_REWARD_ORDER[orderIndex])) orderIndex++;
        const hero = POLAR_REWARD_ORDER[orderIndex++];
        if (!hero) return;
        mail.rewards.hero = hero;
        mail.content = `恭喜达成目标！北极英雄 ${ANIMALS[hero].name} 已送到邮件附件，请手动领取。`;
        unlocked.add(hero);
    });
    saveMails(mails);
}

function grantEligiblePolarRewards() {
    const reachedRankTier = gameState.rank.tier;
    let rewardedRankTier = Math.max(0, parseInt(localStorage.getItem('polarRankRewardTier')) || 0);
    while (rewardedRankTier < reachedRankTier) {
        rewardedRankTier++;
        sendSpecificPolarHeroReward(`段位晋升奖励 · ${RANK_TIERS[rewardedRankTier]}`, POLAR_RANK_REWARDS[rewardedRankTier - 1]);
    }
    localStorage.setItem('polarRankRewardTier', rewardedRankTier);

    const reachedLevelMilestone = Math.floor(gameState.account.level / 5);
    let rewardedLevelMilestone = Math.max(0, parseInt(localStorage.getItem('polarLevelRewardMilestone')) || 0);
    while (rewardedLevelMilestone < reachedLevelMilestone) {
        rewardedLevelMilestone++;
        sendSpecificPolarHeroReward(`账号 Lv.${rewardedLevelMilestone * 5} 奖励`, POLAR_LEVEL_REWARDS[rewardedLevelMilestone - 1]);
    }
    localStorage.setItem('polarLevelRewardMilestone', rewardedLevelMilestone);
}
// 奖励路线调整后，旧账号曾按旧顺序领过奖励；按当前段位补发缺少的对应英雄，绝不扣回已领取英雄。
function repairPolarRewardTrack() {
    if (localStorage.getItem('polarRewardTrackVersion') === '2') return;
    for (let tier = 1; tier <= gameState.rank.tier; tier++) {
        const hero = POLAR_RANK_REWARDS[tier - 1];
        if (hero) sendSpecificPolarHeroReward(`奖励路线补发 · ${RANK_TIERS[tier]}`, hero);
    }
    const milestones = Math.floor(gameState.account.level / 5);
    for (let milestone = 1; milestone <= milestones; milestone++) {
        const hero = POLAR_LEVEL_REWARDS[milestone - 1];
        if (hero) sendSpecificPolarHeroReward(`奖励路线补发 · 账号 Lv.${milestone * 5}`, hero);
    }
    localStorage.setItem('polarRewardTrackVersion', '2');
}
function claimMail(index) {
    const mails = getMails();
    const mail = mails[index];
    if (!mail || mail.claimed) return;
    const rewards = mail.rewards || {};
    const gainedSkinChoiceChest = rewards.skinChoiceChest || 0;
    if (rewards.coins) {
        gameState.stats.coins += rewards.coins;
        localStorage.setItem('coins', gameState.stats.coins);
    }
    if (rewards.renameCard) gameState.account.inventory.renameCard = (gameState.account.inventory.renameCard || 0) + rewards.renameCard;
    if (rewards.rankStarCard) gameState.account.inventory.rankStarCard = (gameState.account.inventory.rankStarCard || 0) + rewards.rankStarCard;
    if (rewards.rankProtectCard) gameState.account.inventory.rankProtectCard = (gameState.account.inventory.rankProtectCard || 0) + rewards.rankProtectCard;
    if (rewards.outsideChestTicket) gameState.account.inventory.outsideChestTicket = (gameState.account.inventory.outsideChestTicket || 0) + rewards.outsideChestTicket;
    if (rewards.skinChoiceChest) gameState.account.inventory.skinChoiceChest = (gameState.account.inventory.skinChoiceChest || 0) + rewards.skinChoiceChest;
    addSkinFragments(rewards);
    if (rewards.hero && ANIMALS[rewards.hero]) {
        ANIMALS[rewards.hero].unlocked = true;
        saveUnlockedHeroes();
    }
    mail.claimed = true; mail.read = true;
    saveMails(mails); saveAccount();
    showRewardToast(rewards);
    openAccountPanel('mail');
    if (gainedSkinChoiceChest) showSkinChoiceChestPrompt(gainedSkinChoiceChest);
}

function rewardText(rewards) {
    const items=[];
    if (rewards.coins) items.push(`🪙 金币 ×${rewards.coins}`);
    if (rewards.renameCard) items.push(`🎫 改名卡 ×${rewards.renameCard}`);
    if (rewards.rankStarCard) items.push(`⭐ 排位加星卡 ×${rewards.rankStarCard}`);
    if (rewards.rankProtectCard) items.push(`🛡️ 排位保护卡 ×${rewards.rankProtectCard}`);
    if (rewards.outsideChestTicket) items.push(`🎁 局外宝箱券 ×${rewards.outsideChestTicket}`);
    if (rewards.skinChoiceChest) items.push(`🎀 皮肤碎片自选宝箱 ×${rewards.skinChoiceChest}`);
    Object.entries(rewards.skinFragments || {}).forEach(([rarity, amount]) => items.push(`🧩 ${SKIN_RARITY_INFO[rarity]?.label || rarity}皮肤碎片 ×${amount}`));
    if (rewards.hero && ANIMALS[rewards.hero]) items.push(`${ANIMALS[rewards.hero].emoji} ${ANIMALS[rewards.hero].name}`);
    if (rewards.skin) {
        const skin = HERO_SKINS[rewards.skin.type]?.find(item => item.id === rewards.skin.id);
        if (skin) items.push(`🎨 ${skin.name}`);
    }
    return items.length ? items.join('\n') : '没有可领取的附件';
}
function showRewardToast(rewards) { window.alert(`领取成功！\n${rewardText(rewards)}`); }
function claimAllMails() {
    const mails=getMails(); const rewards={coins:0,renameCard:0,rankStarCard:0,rankProtectCard:0,outsideChestTicket:0,skinChoiceChest:0,skinFragments:{}}; const heroes=[];
    let count=0;
    mails.forEach(mail => {
        if (mail.claimed) return;
        const r=mail.rewards||{}; count++;
        if (r.coins) { gameState.stats.coins+=r.coins; rewards.coins+=r.coins; }
        if (r.renameCard) { gameState.account.inventory.renameCard=(gameState.account.inventory.renameCard||0)+r.renameCard; rewards.renameCard+=r.renameCard; }
        if (r.rankStarCard) { gameState.account.inventory.rankStarCard=(gameState.account.inventory.rankStarCard||0)+r.rankStarCard; rewards.rankStarCard+=r.rankStarCard; }
        if (r.rankProtectCard) { gameState.account.inventory.rankProtectCard=(gameState.account.inventory.rankProtectCard||0)+r.rankProtectCard; rewards.rankProtectCard+=r.rankProtectCard; }
        if (r.outsideChestTicket) { gameState.account.inventory.outsideChestTicket=(gameState.account.inventory.outsideChestTicket||0)+r.outsideChestTicket; rewards.outsideChestTicket=(rewards.outsideChestTicket||0)+r.outsideChestTicket; }
        if (r.skinChoiceChest) { gameState.account.inventory.skinChoiceChest=(gameState.account.inventory.skinChoiceChest||0)+r.skinChoiceChest; rewards.skinChoiceChest=(rewards.skinChoiceChest||0)+r.skinChoiceChest; }
        if (r.skinFragments) { addSkinFragments(r); Object.entries(r.skinFragments).forEach(([rarity, amount]) => rewards.skinFragments[rarity] = (rewards.skinFragments[rarity] || 0) + amount); }
        if (r.hero && ANIMALS[r.hero]) { ANIMALS[r.hero].unlocked=true; heroes.push(`${ANIMALS[r.hero].emoji} ${ANIMALS[r.hero].name}`); }
        mail.claimed=true; mail.read=true;
    });
    if (!count) return window.alert('没有可领取的邮件附件。');
    localStorage.setItem('coins', gameState.stats.coins); saveUnlockedHeroes(); saveMails(mails); saveAccount();
    window.alert(`一键领取成功！\n${rewardText(rewards)}${heroes.length ? `\n${heroes.join('\n')}` : ''}`);
    openAccountPanel('mail');
    if (rewards.skinChoiceChest) showSkinChoiceChestPrompt(rewards.skinChoiceChest);
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

function normalizeInventory() {
    const inventory = gameState.account.inventory || (gameState.account.inventory = {});
    inventory.renameCard = Math.max(0, inventory.renameCard || 0);
    inventory.rankStarCard = Math.max(0, inventory.rankStarCard || 0);
    inventory.rankProtectCard = Math.max(0, inventory.rankProtectCard || 0);
    inventory.outsideChestTicket = Math.max(0, inventory.outsideChestTicket || 0);
    inventory.skinChoiceChest = Math.max(0, inventory.skinChoiceChest || 0);
    ['normal','rare','epic','mythic','legendary'].forEach(rarity => inventory[`fragment_${rarity}`] = Math.max(0, inventory[`fragment_${rarity}`] || 0));
}

function checkReturnGift(hadAccount) {
    const now = Date.now();
    const lastLoginAt = Number(localStorage.getItem('lastLoginAt')) || 0;
    if (hadAccount && lastLoginAt && now - lastLoginAt >= 15 * 24 * 60 * 60 * 1000) {
        sendRewardMail(
            '🎁 回归福利',
            '欢迎回来！你已经超过 15 天没有登录，送上 1000 金币、1 张排位加星卡和 1 张排位保护卡。请前往邮件手动领取。',
            { coins:1000, rankStarCard:1, rankProtectCard:1 }
        );
    }
    localStorage.setItem('lastLoginAt', String(now));
}

function initAccount() {
    const hadAccount = !!gameState.account.name;
    normalizeInventory();
    if (!gameState.account.name) {
        const banned = /傻[逼比]|妈的|操|fuck|shit|外挂|作弊/i;
        let name = window.prompt('欢迎来到吞噬大冒险！请给自己取一个名字：', '冒险家') || '冒险家';
        if (banned.test(name) || name.trim().length < 2) name = '冒险家';
        gameState.account.name = name.trim().slice(0, 12);
        gameState.account.inventory.renameCard = gameState.account.inventory.renameCard || 0;
        sendRewardMail('欢迎加入！', '欢迎礼包：一张改名卡。请前往邮件手动领取。', { renameCard: 1 });
    }
    repairPolarRewardTrack();
    checkReturnGift(hadAccount);
    saveAccount();
}
function saveAccount() {
    const a = gameState.account;
    localStorage.setItem('playerName', a.name); localStorage.setItem('accountLevel', a.level); localStorage.setItem('accountExp', a.exp); localStorage.setItem('reputation', a.reputation); localStorage.setItem('inventory', JSON.stringify(a.inventory));
}
// 存档备份保存在玩家电脑中；它与 GitHub 账号、网站地址无关，可用于换设备恢复记录。
function exportGameSave() {
    saveAccount();
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) data[key] = localStorage.getItem(key);
    }
    const backup = { game:'吞噬模拟器', version:1, exportedAt:new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type:'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `吞噬模拟器存档_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
    window.alert('存档已导出！请把下载的 JSON 文件保存在安全的位置。');
}
window.exportGameSave = exportGameSave;
function importGameSave(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const backup = JSON.parse(reader.result);
            if (backup?.game !== '吞噬模拟器' || !backup.data || typeof backup.data !== 'object') throw new Error('invalid save');
            if (!window.confirm('导入会覆盖当前浏览器里的游戏记录，确定继续吗？')) return;
            Object.entries(backup.data).forEach(([key, value]) => { if (typeof value === 'string') localStorage.setItem(key, value); });
            window.alert('存档导入成功！游戏将重新打开并读取恢复后的记录。');
            window.location.reload();
        } catch (_) { window.alert('这个文件不是有效的《吞噬模拟器》存档。'); }
    };
    reader.readAsText(file);
}
function accountExp(amount) {
    const a=gameState.account; a.exp+=amount;
    while (a.exp >= a.level * 100) {
        a.exp -= a.level * 100;
        a.level++;
        sendRewardMail('账号升级奖励',`恭喜升到 ${a.level} 级，附件含 ${a.level*50} 金币，请手动领取。`,{coins:a.level*50});
    }
    grantEligiblePolarRewards();
    saveAccount();
}

function showHall() {
    // 若页面跨过了赛季切换时刻，回到大厅时自动载入新赛季内容。
    if (currentBattlePassSeason().id !== BATTLE_PASS_SEASON) { window.location.reload(); return; }
    const releasedHeroes = Object.values(ANIMALS).filter(isHeroReleased);
    const unlocked = releasedHeroes.filter(animal => animal.unlocked).length;
    document.getElementById('hallRank').textContent = `当前段位：${rankLabel()}`;
    document.getElementById('hallCoins').textContent = `🪙 ${gameState.stats.coins} 金币`;
    document.getElementById('accountName').textContent = `👤 ${gameState.account.name}`;
    document.getElementById('accountLevel').textContent = `Lv.${gameState.account.level} · ${gameState.account.exp}/${gameState.account.level * 100} 账号经验`;
    // 信誉分系统已移除，账号只保留等级与金币进度。
    document.getElementById('hallHeroes').textContent = `英雄图鉴：${unlocked}/${releasedHeroes.length} 已解锁（进入模式后可购买英雄）`;
    const signedToday = localStorage.getItem('signDate') === new Date().toDateString();
    let signDay = Math.min(7, parseInt(localStorage.getItem('signDay')) || 0);
    // 老存档可能没有写入第七天计数；已拥有签到专属狐狸和火凤凰就视为完成。
    const signComplete = signDay >= 7 || (ANIMALS.fox.unlocked && ANIMALS.phoenix.unlocked);
    if (signComplete && signDay < 7) { signDay = 7; localStorage.setItem('signDay', '7'); }
    const todayDay = signComplete ? 7 : (signedToday ? signDay : signDay + 1);
    document.getElementById('signInCard').hidden = signComplete;
    document.getElementById('signProgress').textContent = signComplete ? '新手七日签到已完成' : `今天是新手签到第 ${todayDay} 天（进度 ${signDay}/7）`;
    document.getElementById('signButton').disabled = signedToday || signComplete;
    document.getElementById('signButton').textContent = signComplete ? '新手签到已完成' : (signedToday ? '今日已签到' : `签到第 ${todayDay} 天`);
    const hundredCard = document.getElementById('hundredSignCard');
    const hundredDay = Math.min(100, parseInt(localStorage.getItem('hundredSignDay')) || 0);
    const hundredSignedToday = localStorage.getItem('hundredSignDate') === new Date().toDateString();
    const hundredSignEnded = Date.now() >= HUNDRED_SIGN_DEADLINE;
    hundredCard.hidden = !signComplete;
    const deadlineText = '活动截止：2026 年 12 月 1 日 00:00（北京时间）';
    document.getElementById('hundredSignProgress').textContent = hundredSignEnded ? '活动已于 2026 年 12 月 1 日 00:00 截止' : hundredDay >= 100 ? `百天签到已完成 · ${deadlineText}` : `今天是百天签到第 ${hundredSignedToday ? hundredDay : hundredDay + 1} 天（进度 ${hundredDay}/100）· ${deadlineText}`;
    document.getElementById('hundredSignButton').disabled = hundredSignEnded || hundredSignedToday || hundredDay >= 100;
    document.getElementById('hundredSignButton').textContent = hundredSignEnded ? '活动已截止' : hundredDay >= 100 ? '百天签到已完成' : (hundredSignedToday ? '今日已签到' : `签到第 ${hundredDay + 1} 天`);
    const outsideChest = outsideChestState();
    document.getElementById('outsideChestProgress').textContent = outsideChest.claimed ? ((gameState.account.inventory.outsideChestTicket || 0) > 0 ? `今日奖励已领取；背包还有 ${gameState.account.inventory.outsideChestTicket} 张宝箱券可额外开启。` : '今日奖励已领取，明天可再挑战一次。') : `${outsideChest.ticketRun ? '宝箱券挑战' : '今日可挑战'} · 已敲击 ${outsideChest.taps}/4 次，品质：${OUTSIDE_CHEST_TIERS[outsideChest.tier].name}`;
    const outsideChestButton = document.getElementById('outsideChestOpenButton');
    if (outsideChestButton) {
        const hasTicket = (gameState.account.inventory.outsideChestTicket || 0) > 0;
        outsideChestButton.disabled = outsideChest.claimed && !hasTicket;
        outsideChestButton.textContent = outsideChest.claimed ? (hasTicket ? `使用宝箱券（${gameState.account.inventory.outsideChestTicket}）` : '今日已领取') : '打开宝箱';
    }
    document.getElementById('deviceModeText').textContent = `当前：${controlMode === 'mobile' ? '手机摇杆' : '电脑键盘'}`;
    document.getElementById('desktopModeButton').classList.toggle('selected', controlMode === 'desktop');
    document.getElementById('mobileModeButton').classList.toggle('selected', controlMode === 'mobile');
    updateHallBadge('mailBadge', getMails().filter(mail => !mail.claimed).length);
    updateHallBadge('battlePassBadge', battlePassClaimableCount());
    updateHallBadge('activityBadge', activityClaimableCount());
    updateControlLayout();
    document.getElementById('hallModal').classList.remove('hidden');
}

function openAccountPanel(kind) {
    const title = document.getElementById('subPageTitle');
    const content = document.getElementById('subPageContent');
    const cards = (items) => `<div class="animals-grid">${items}</div>`;
    if (kind === 'hero') {
        title.textContent = '🦸 英雄图鉴';
        content.innerHTML = cards(heroesByPower().map(([key, h]) => {
            const wardrobe = HERO_SKINS[key]?.filter(isSkinReleased).length > 1 ? `<button class="hero-wardrobe" type="button" onclick="openHeroSkinGallery('${key}')">👕 查看皮肤</button>` : '';
            return `<div class="animal-card" style="opacity:${h.unlocked ? 1 : .55}"><div class="animal-emoji">${heroIconMarkup(key, h)}</div><div>${heroRarityMarkup(h)}</div><div class="animal-name">${h.name}</div><div class="animal-stats">战力 ${calculateHeroPower(h)}<br>${h.unlocked ? '已解锁' : h.seasonReward ? `📜 ${h.futureSeason || 'S1'} 免费战令 Lv.50 领取` : h.rewardOnly ? `❄️ ${polarUnlockCondition(key)}` : h.signOnly ? '签到专属' : `售价 ${h.price} 金币`}</div>${wardrobe}</div>`;
        }).join(''));
    } else if (kind === 'skinCodex') {
        title.textContent = '🎨 皮肤图鉴';
        const allSkins = sortSkinEntriesByRarity(Object.entries(HERO_SKINS).filter(([heroKey]) => isHeroReleased(ANIMALS[heroKey])).flatMap(([heroKey, skins]) => skins.filter(skin => skin.id !== 'default' && isSkinReleased(skin)).map(skin => ({ heroKey, skin }))));
        const ownedCount = allSkins.filter(({ heroKey, skin }) => ownsSkin(heroKey, skin)).length;
        const cardsMarkup = allSkins.map(({ heroKey, skin }) => {
            const hero = ANIMALS[heroKey], owned = ownsSkin(heroKey, skin);
            const preview = heroIconMarkup(heroKey, hero, skin);
            const how = skin.battlePassOnly ? `${skin.futureSeason || 'S1'} 进阶战令 Lv.50` : `商城售价：🪙 ${skin.price}`;
            return `<div class="animal-card skin-gallery-card" style="--skin-color:${skin.color}"><div class="skin-preview">${preview}</div><div>${skinRarityMarkup(skin)}</div><div class="animal-name">${skin.name}</div><div class="animal-stats">${hero.name} · ${owned ? '✅ 已拥有' : '🔒 未拥有'}<br>${how}${skin.themeText ? `<br>赛季主题：${skin.themeText}` : ''}</div></div>`;
        }).join('');
        content.innerHTML = `<div class="feedback-box"><div class="feedback-heading">皮肤收藏进度：${ownedCount}/${allSkins.length}</div><div>这里展示全部皮肤的品质与拥有状态。皮肤仅改变外观和技能特效颜色，不改变英雄属性。</div></div><div class="animals-grid">${cardsMarkup}</div>`;
    } else if (kind === 'battlePass') {
        title.textContent = `📜 吞噬战令 · ${BATTLE_PASS_SEASON} ${BATTLE_PASS_THEME}`;
        const pass = battlePassState(), level = battlePassLevel(pass), levelExp = pass.exp % 100;
        const seasonHero = ANIMALS[BATTLE_PASS_CONFIG.hero];
        const seasonSkin = HERO_SKINS[BATTLE_PASS_CONFIG.skin.type]?.find(skin => skin.id === BATTLE_PASS_CONFIG.skin.id);
        const taskDefs = battlePassTasks(pass);
        const taskCards = taskDefs.map(task => {
            const claimed = task.weekly ? pass.weeklyClaimed[task.key] : pass.dailyClaimed[task.key];
            const done = task.progress >= task.target;
            return `<div class="skill-card"><div class="skill-name">${task.group} · ${task.name}</div><div class="skill-desc">进度 ${Math.min(task.progress, task.target)}/${task.target} · 战令经验 +${task.exp}</div><button class="btn ${claimed ? '' : 'btn-success'}" type="button" ${claimed || !done ? 'disabled' : ''} onclick="claimBattlePassTask('${task.key}')">${claimed ? '已领取' : done ? '领取战令经验' : '进行中'}</button></div>`;
        }).join('');
        const rewards = Array.from({length:BATTLE_PASS_LEVELS}, (_, index) => {
            const tier = index + 1, reward = battlePassReward(tier), premiumReward = battlePassPremiumReward(tier), claimed = !!pass.rewardClaims[tier], premiumClaimed = !!pass.premiumRewardClaims[tier], unlocked = tier <= level;
            return `<div class="animal-card" style="opacity:${unlocked ? 1 : .55}"><div class="animal-emoji">${tier === 50 ? heroIconMarkup(BATTLE_PASS_CONFIG.hero, seasonHero) : tier % 10 === 0 ? '🎀' : tier % 5 === 0 ? '🎁' : '⭐'}</div><div class="animal-name">战令 Lv.${tier}</div><div class="animal-stats"><strong>免费奖励</strong><br>${rewardText(reward).replace(/\n/g, '<br>')}</div><button class="btn ${claimed ? '' : 'btn-success'}" type="button" ${claimed || !unlocked ? 'disabled' : ''} onclick="claimBattlePassReward(${tier})">${claimed ? '免费已领取' : unlocked ? '领取免费奖励' : '未解锁'}</button><div class="animal-stats" style="margin-top:10px;color:#cdb4ff"><strong>进阶奖励</strong><br>${rewardText(premiumReward).replace(/\n/g, '<br>')}</div><button class="btn ${premiumClaimed ? '' : 'btn-primary'}" type="button" ${premiumClaimed || !unlocked || !pass.premium ? 'disabled' : ''} onclick="claimBattlePassReward(${tier},true)">${premiumClaimed ? '进阶已领取' : !pass.premium ? '未解锁进阶版' : unlocked ? '领取进阶奖励' : '未解锁'}</button></div>`;
        }).join('');
        const seasonStatus = battlePassSeasonActive() ? '进行中' : '已结束';
        const premiumPanel = pass.premium
            ? '<div class="tip" style="border-color:#9c72e8">💎 已解锁进阶战令：已达到的进阶奖励均可领取。</div>'
            : `<div class="feedback-box"><div class="feedback-heading">💎 进阶战令</div><div>花费 🪙 ${BATTLE_PASS_PREMIUM_PRICE} 金币解锁本赛季进阶奖励。Lv.50 可获得${seasonHero.name}史诗皮肤「${seasonSkin.name}」${seasonSkin.themeText ? `，专属主题为“${seasonSkin.themeText}”` : ''}。新赛季开启后需重新解锁。</div><button class="btn btn-primary" type="button" ${battlePassSeasonActive() ? '' : 'disabled'} onclick="purchasePremiumBattlePass()">解锁进阶战令</button></div>`;
        content.innerHTML = `<div class="feedback-box battle-pass-banner" style="background:linear-gradient(135deg,#176b5a,#315fa8,#68489c)"><div class="feedback-heading">📜 ${BATTLE_PASS_SEASON} 赛季 · ${BATTLE_PASS_THEME}</div><div>${BATTLE_PASS_CONFIG.description}</div><div>赛季时间：${battlePassDateLabel(BATTLE_PASS_START_AT)}—${battlePassDateLabel(BATTLE_PASS_END_AT)} · ${seasonStatus}</div><div>当前 Lv.${level}/${BATTLE_PASS_LEVELS} · ${level >= BATTLE_PASS_LEVELS ? '已满级' : `距离下一级还需 ${100 - levelExp} 战令经验`}</div><div>✅ 今日首次登录战令经验 +${BATTLE_PASS_DAILY_LOGIN_EXP} 已自动领取</div><div style="height:10px;background:#111a36;border-radius:8px;margin-top:10px;overflow:hidden"><div style="height:100%;width:${level >= BATTLE_PASS_LEVELS ? 100 : levelExp}%;background:linear-gradient(90deg,#62efc4,#63b7ff,#c079ff)"></div></div><button class="btn btn-success" type="button" onclick="claimAllBattlePass()">🎁 一键领取</button></div>${premiumPanel}<div class="tip">每日首次登录会自动获得 ${BATTLE_PASS_DAILY_LOGIN_EXP} 战令经验；每日任务每天北京时间 00:00 刷新，每周任务每周一刷新。免费与进阶战令等级共用，Lv.50 免费奖励为新英雄「${seasonHero.name}」。赛季切换后战令等级、任务和领取记录重置，进阶版恢复为未解锁。</div><h3>每日与每周任务</h3>${taskCards}<h3>免费与进阶奖励</h3><div class="animals-grid">${rewards}</div>`;
    } else if (kind === 'skinChoiceChest') {
        title.textContent = '🎀 开启皮肤碎片自选宝箱';
        content.innerHTML = availableSkinChoiceChestCount() ? skinChoicePickerMarkup() : '<div class="tip">背包里暂时没有皮肤碎片自选宝箱。</div>';
    } else if (kind === 'activity') {
        title.textContent = '🎉 活动中心';
        const played = dailyPlaySeconds();
        const claims = dailyPlayClaims();
        const playCards = DAILY_PLAY_REWARDS.map((reward, index) => {
            const unlocked = played >= reward.minutes * 60, claimed = claims.includes(index);
            return `<div class="skill-card"><div class="skill-name">⏱️ 游玩 ${reward.minutes} 分钟</div><div class="skill-desc">奖励：🪙 ${reward.coins} 金币<br>今日累计：${Math.floor(played / 60)} 分钟 ${Math.floor(played % 60)} 秒</div><button class="btn ${claimed ? '' : 'btn-success'}" type="button" ${claimed || !unlocked ? 'disabled' : ''} onclick="claimDailyPlayReward(${index})">${claimed ? '已领取' : unlocked ? '领取奖励' : `还差 ${Math.max(0, Math.ceil((reward.minutes * 60 - played) / 60))} 分钟`}</button></div>`;
        }).join('');
        const weekday = dailyActivityWeekday();
        const weekly = DAILY_WEEKLY_REWARDS.map(item => `<div class="skill-card" style="opacity:${item.day === weekday ? 1 : .62}"><div class="skill-name">${item.day === weekday ? '📍 今天 · ' : ''}${item.label}</div><div class="skill-desc">${rewardText(item.rewards).replace(/\n/g, '<br>')}</div></div>`).join('');
        const signed = localStorage.getItem('weeklyDailySignDate') === dailyActivityDate();
        const choices = Object.entries(SKIN_CHOICE_REWARDS).map(([rarity, amount]) => `<button class="btn btn-success" type="button" ${gameState.account.inventory.skinChoiceChest ? '' : 'disabled'} onclick="claimSkinChoiceChest('${rarity}')">选择 ${amount} 个${SKIN_RARITY_INFO[rarity].label}碎片</button>`).join(' ');
        const fridaySkins = Object.entries(HERO_SKINS).filter(([heroKey]) => isHeroReleased(ANIMALS[heroKey])).flatMap(([heroKey, skins]) => skins.filter(skin => isSkinReleased(skin) && skin.price && ['normal','rare'].includes(skinRarity(skin))).map(skin => ({ heroKey, skin })));
        const fridayTrials = isSuperFriday() ? `<div class="animals-grid">${fridaySkins.map(({heroKey,skin}) => `<div class="animal-card"><div class="animal-emoji">${heroIconMarkup(heroKey, ANIMALS[heroKey], skin)}</div><div>${skinRarityMarkup(skin)}</div><div class="animal-name">${skin.name}</div><div class="animal-stats">${ANIMALS[heroKey].name} · 周五免费体验</div><button class="btn btn-success" type="button" onclick="startSkinTrial('${heroKey}','${skin.id}')">🎮 免费试玩</button></div>`).join('')}</div>` : '<div class="tip">超级星期五将于下一个周五 00:00 开启：届时可免费体验全部普通、稀有皮肤。</div>';
        const fridayStatus = isSuperFriday() ? (localStorage.getItem('superFridayFirstRankDate') === dailyActivityDate() ? '今日首局排位已结算。' : '今天第一局排位胜利可额外 +1 星。') : '每周五 00:00 至 23:59 开启。';
        content.innerHTML = `<div style="display:flex;gap:10px;margin-bottom:14px"><button class="btn btn-primary" type="button" onclick="switchActivityTab('daily')">📅 日常活动</button><button class="btn" type="button" onclick="switchActivityTab('limited')">⏳ 限时活动</button></div><div id="activityDaily"><div class="feedback-box"><div class="feedback-heading">每日游玩时长</div><div>每天北京时间 00:00 刷新。进入对局后的有效游玩时间会自动累计，奖励会通过邮件发放。</div></div>${playCards}<div class="feedback-box"><div class="feedback-heading">🗓️ 日常签到</div><div>每天 00:00 刷新。今日签到奖励将通过邮件发放。</div></div><div class="animals-grid">${weekly}</div><button class="btn ${signed ? '' : 'btn-success'}" type="button" ${signed ? 'disabled' : ''} onclick="claimWeeklyDailySign()">${signed ? '今日已签到' : '领取今日签到奖励'}</button><div class="feedback-box"><div class="feedback-heading">🎁 礼包码兑换</div><div>输入有效礼包码即可兑换；每个礼包码每个存档只能使用一次，奖励会发送到系统邮件。</div><form class="gift-code-row" onsubmit="redeemGiftCode(event)"><input id="giftCodeInput" class="gift-code-input" type="text" maxlength="32" autocomplete="off" spellcheck="false" placeholder="请输入礼包码" aria-label="礼包码"><button class="btn btn-success" type="submit">立即兑换</button></form><div id="giftCodeStatus" class="gift-code-status" aria-live="polite"></div></div></div><div id="activityLimited" style="display:none"><div class="feedback-box"><div class="feedback-heading">🌟 超级星期五 ${isSuperFriday() ? '· 正在进行' : ''}</div><div>周五免费体验全部普通、稀有皮肤；当天第一局<strong>排位模式</strong>胜利额外 +1 星。失败不会抵扣扣星，也不会变成保护卡。进化试炼的账号经验与金币奖励提升 50%。<br>${fridayStatus}</div></div>${fridayTrials}<div class="feedback-box"><div class="feedback-heading">🎀 皮肤碎片自选宝箱</div><div>当前拥有：${gameState.account.inventory.skinChoiceChest || 0} 个。每个宝箱可任选一份奖励；有多个宝箱时可分开选择不同品质。</div></div><div class="skill-card"><div class="skill-name">自选一份皮肤碎片</div><div class="skill-desc">普通 ×20 · 稀有 ×10 · 史诗 ×5 · 神话 ×3 · 传说 ×1</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">${choices}</div></div><div class="tip">周六、周日的日常签到可获得皮肤碎片自选宝箱。</div></div>`;
        // 限时活动优先展示：把它放到日常活动前面，并作为进入活动中心时的默认页。
        const activityTabs = content.firstElementChild;
        const activityDaily = document.getElementById('activityDaily');
        const activityLimited = document.getElementById('activityLimited');
        // 超级星期五属于每周固定日常，放在日常活动页；限时活动页只保留当前可开启的宝箱内容。
        const fridayInfo = activityLimited?.querySelector('.feedback-box');
        const fridayTrialsNode = fridayInfo?.nextElementSibling;
        if (activityDaily && fridayInfo) {
            activityDaily.insertBefore(fridayInfo, activityDaily.firstChild);
            if (fridayTrialsNode) activityDaily.insertBefore(fridayTrialsNode, fridayInfo.nextElementSibling);
        }
        if (activityLimited) activityLimited.innerHTML = limitedGiftEventMarkup();
        if (activityTabs && activityDaily && activityLimited) {
            const [dailyButton, limitedButton] = activityTabs.querySelectorAll('button');
            if (dailyButton && limitedButton) {
                activityTabs.insertBefore(limitedButton, dailyButton);
                limitedButton.classList.add('btn-primary');
                dailyButton.classList.remove('btn-primary');
            }
            activityDaily.style.display = 'none';
            activityLimited.style.display = '';
        }
    } else if (kind === 'road') {
        title.textContent = '🧭 英雄之路';
        const rankRoad = RANK_TIERS.slice(1).map((tier, index) => `<div class="skill-card"><div class="skill-name">${gameState.rank.tier >= index + 1 ? '✅' : '🔒'} 晋升 ${tier}</div><div class="skill-desc">奖励：${heroIconMarkup(POLAR_RANK_REWARDS[index], ANIMALS[POLAR_RANK_REWARDS[index]])} ${ANIMALS[POLAR_RANK_REWARDS[index]].name}</div></div>`).join('');
        const levelRoad = [5,10,15,20,25,30].map((level, index) => `<div class="skill-card"><div class="skill-name">${gameState.account.level >= level ? '✅' : '🔒'} 账号 Lv.${level}</div><div class="skill-desc">奖励：${heroIconMarkup(POLAR_LEVEL_REWARDS[index], ANIMALS[POLAR_LEVEL_REWARDS[index]])} ${ANIMALS[POLAR_LEVEL_REWARDS[index]].name}。当前账号等级：Lv.${gameState.account.level}</div></div>`).join('');
        content.innerHTML = `<div style="display:flex;gap:10px;margin-bottom:14px"><button class="btn btn-primary" type="button" onclick="switchHeroRoad('rank')">🏆 段位奖励</button><button class="btn" type="button" onclick="switchHeroRoad('level')">📊 等级奖励</button></div><div id="heroRoadRank"><h3>🏆 段位奖励</h3>${rankRoad}</div><div id="heroRoadLevel" style="display:none"><h3>📊 等级奖励</h3>${levelRoad}</div>`;
    } else if (kind === 'bag') {
        title.textContent = '🎒 背包';
        const fragmentCards = ['normal','rare','epic','mythic','legendary'].map(rarity => `<div class="animal-card"><div class="animal-emoji">🧩</div><div>${skinRarityMarkup({id:'fragment',rarity})}</div><div class="animal-name">${SKIN_RARITY_INFO[rarity].label}皮肤碎片</div><div class="animal-stats">数量 ×${gameState.account.inventory[`fragment_${rarity}`] || 0}<br>可在商城 → 碎片兑换中使用。</div></div>`).join('');
        content.innerHTML = cards(`<div class="animal-card"><div class="animal-emoji">🪙</div><div class="animal-name">金币</div><div class="animal-stats">${gameState.stats.coins}</div></div><div class="animal-card"><div class="animal-emoji">🪪</div><div class="animal-name">改名卡</div><div class="animal-stats">数量 ×${gameState.account.inventory.renameCard || 0}</div><button class="btn btn-success" type="button" ${gameState.account.inventory.renameCard ? '' : 'disabled'} onclick="useRenameCard()">使用改名卡</button></div><div class="animal-card"><div class="animal-emoji">⭐</div><div class="animal-name">排位加星卡</div><div class="animal-stats">数量 ×${gameState.account.inventory.rankStarCard || 0}<br>排位结算获得星星时自动使用，额外 +1 星。</div></div><div class="animal-card"><div class="animal-emoji">🛡️</div><div class="animal-name">排位保护卡</div><div class="animal-stats">数量 ×${gameState.account.inventory.rankProtectCard || 0}<br>排位失败扣星时自动使用。</div></div><div class="animal-card"><div class="animal-emoji">🎁</div><div class="animal-name">局外宝箱券</div><div class="animal-stats">数量 ×${gameState.account.inventory.outsideChestTicket || 0}<br>每日宝箱已开后，可额外开启一局宝箱挑战。</div></div><div class="animal-card"><div class="animal-emoji">🎀</div><div class="animal-name">皮肤碎片自选宝箱</div><div class="animal-stats">数量 ×${gameState.account.inventory.skinChoiceChest || 0}<br>前往活动页，可自选一份皮肤碎片。</div></div>${fragmentCards}`);
        const choiceChestCard = [...content.querySelectorAll('.animal-card')].find(card => card.textContent.includes('皮肤碎片自选宝箱'));
        if (choiceChestCard) choiceChestCard.innerHTML = `<div class="animal-emoji">🎀</div><div class="animal-name">皮肤碎片自选宝箱</div><div class="animal-stats">数量 ×${availableSkinChoiceChestCount()}<br>打开后可自由选择不同品质的皮肤碎片。</div><button class="btn btn-success" type="button" ${availableSkinChoiceChestCount() ? '' : 'disabled'} onclick="openSkinChoiceChestFromBag()">打开宝箱</button>`;
        const coinCard = content.querySelector('.animal-card');
        if (coinCard) { coinCard.style.cursor = 'pointer'; coinCard.title = '点击查看金币用途'; coinCard.onclick = showCoinHelp; }
    } else if (kind === 'shop') {
        title.textContent = '🛒 商城';
        const gameShop = cards(heroesByRarity()
            .filter(([, h]) => !h.unlocked && !h.signOnly && !h.rewardOnly)
            .map(([key,h]) => `<button class="animal-card" type="button" onclick="confirmPurchase('${key}')"><div class="animal-emoji">${heroIconMarkup(key, h)}</div><div>${heroRarityMarkup(h)}</div><div class="animal-name">${h.name}</div><div class="animal-stats">战力 ${calculateHeroPower(h)}<br>🪙 ${h.price} 金币</div></button>`).join('') || '<div class="tip">当前可购买英雄已全部拥有。</div>');
        const skinShopEntries = sortSkinEntriesByRarity(Object.entries(HERO_SKINS).filter(([heroKey]) => isHeroReleased(ANIMALS[heroKey])).flatMap(([heroKey, skins]) => skins.filter(skin => isSkinReleased(skin) && skin.price && !skin.battlePassOnly && !ownsSkin(heroKey, skin)).map(skin => ({ heroKey, skin }))));
        const skinShop = cards(skinShopEntries.map(({ heroKey, skin }) => {
            const hero = ANIMALS[heroKey];
            return `<div class="animal-card"><div class="animal-emoji" style="color:${skin.color}">${heroIconMarkup(heroKey, hero, skin)}</div><div>${skinRarityMarkup(skin)}</div><div class="animal-name">${skin.name}</div><div class="animal-stats">${hero.name} 专属皮肤${skin.themeText ? `<br>主题：${skin.themeText}` : ''}<br>🪙 ${skin.price} 金币</div><button class="btn btn-success" type="button" onclick="selectHeroSkin('${heroKey}','${skin.id}','shop')">购买皮肤</button><button class="btn" type="button" onclick="startSkinTrial('${heroKey}','${skin.id}')">🎮 试玩</button></div>`;
        }).join('') || '<div class="tip">当前可购买皮肤已全部拥有。</div>');
        const itemShop = cards(Object.entries(SHOP_ITEMS).map(([key, item]) => `<div class="animal-card"><div class="animal-emoji">${item.emoji}</div><div class="animal-name">${item.name}</div><div class="animal-stats">${item.desc}<br>🪙 ${item.price} 金币</div><button class="btn btn-success" type="button" onclick="confirmItemPurchase('${key}')">购买道具</button></div>`).join(''));
        const fragmentGroups = ['normal','rare','epic','mythic','legendary'].map(rarity => {
            const exchangeSkins = skinShopEntries.filter(({ skin }) => skinRarity(skin) === rarity);
            const amount = gameState.account.inventory[`fragment_${rarity}`] || 0, cost = SKIN_FRAGMENT_COST[rarity];
            return `<div class="skill-card"><div class="skill-name" style="color:${SKIN_RARITY_INFO[rarity].color}">${SKIN_RARITY_INFO[rarity].label}皮肤碎片 · ${amount}/${cost}</div><div class="animals-grid">${exchangeSkins.map(({heroKey,skin}) => `<div class="animal-card"><div class="animal-emoji">${heroIconMarkup(heroKey, ANIMALS[heroKey], skin)}</div><div>${skinRarityMarkup(skin)}</div><div class="animal-name">${skin.name}</div><div class="animal-stats">${ANIMALS[heroKey].name} 专属皮肤<br>${ownsSkin(heroKey,skin) ? '✅ 已拥有' : `🧩 ${cost} 个${SKIN_RARITY_INFO[rarity].label}碎片`}</div><button class="btn btn-success" type="button" ${ownsSkin(heroKey,skin) ? 'disabled' : ''} onclick="redeemSkinFragments('${heroKey}','${skin.id}')">碎片兑换</button></div>`).join('') || '<div class="tip">该品质皮肤暂未开放兑换。</div>'}</div></div>`;
        }).join('');
        content.innerHTML = `<div style="display:flex;gap:10px;margin-bottom:14px"><button class="btn btn-primary" type="button" onclick="switchShopTab('game')">🦸 英雄</button><button class="btn" type="button" onclick="switchShopTab('skin')">🎨 皮肤</button><button class="btn" type="button" onclick="switchShopTab('fragment')">🧩 碎片兑换</button><button class="btn" type="button" onclick="switchShopTab('item')">🎒 道具</button></div><div id="shopGame">${gameShop}</div><div id="shopSkin" style="display:none">${skinShop}</div><div id="shopFragment" style="display:none">${fragmentGroups}</div><div id="shopItem" style="display:none">${itemShop}</div>`;
    } else if (kind === 'updates') {
        title.textContent = '📢 更新公告';
        content.innerHTML = `<div class="feedback-box"><div class="feedback-heading">v3.5.15 · 活动中心与超级星期五</div><div>最新活动内容</div></div><div class="skill-card"><div class="skill-name">🎉 活动中心</div><div class="skill-desc">• 大厅新增“活动”，分为日常活动和限时活动。<br>• 每日累计游玩 15、30、60、90、120 分钟可领取金币奖励，每天北京时间 00:00 刷新。<br>• 每日签到按星期发放金币、局外宝箱券、排位加星/保护卡或皮肤碎片自选宝箱，奖励通过邮件领取。</div></div><div class="skill-card"><div class="skill-name">🎀 皮肤碎片自选宝箱与稀有品质</div><div class="skill-desc">• 周六、周日签到可获得皮肤碎片自选宝箱，多个宝箱可累计并分别选择奖励。<br>• 每个宝箱可任选：普通碎片 ×20、稀有 ×10、史诗 ×5、神话 ×3 或传说 ×1。<br>• 新增稀有皮肤品质与稀有碎片兑换；苍鹰新增稀有皮肤「极光苍鹰」。</div></div><div class="skill-card"><div class="skill-name">🌟 超级星期五</div><div class="skill-desc">• 每周五免费体验全部普通、稀有皮肤。<br>• 当天第一局排位胜利额外 +1 星；失败仍正常结算，额外星数不会抵扣扣星。<br>• 周五的进化试炼账号经验与击败敌人金币奖励提升 50%。</div></div><div class="skill-card"><div class="skill-name">🏳️ 5v5 三据点争夺</div><div class="skill-desc">• 团队战新增 A、B、C 三据点，可反复抢占；率先占领全部据点的一方获胜。<br>• 阵亡后 3 秒复活，击败英雄不获得经验或生命回复。</div></div>`;
        content.insertAdjacentHTML('afterbegin', `<div class="feedback-box"><div class="feedback-heading">v3.5.17 · S1 万兽启程进阶战令</div><div>赛季时间：2026年8月24日—2026年10月24日</div></div><div class="skill-card"><div class="skill-name">📜 S1「万兽启程」战令升级</div><div class="skill-desc">• 战令共 150 级，新增一键领取；每周击败任务提高为 2500 名敌人，完成可获得 900 战令经验。<br>• 免费战令 Lv.50 可领取全新神话英雄「星角鹿」。<br>• 花费 15000 金币可解锁本赛季进阶战令，Lv.50 可领取星角鹿史诗皮肤「繁星花冠」。<br>• 每日任务于北京时间 00:00 刷新，每周任务于周一刷新。</div></div>`);
    } else if (kind === 'feedback') {
        title.textContent = '💬 游戏反馈';
        content.innerHTML = `<div class="feedback-box"><div class="feedback-heading">帮助吞噬模拟器变得更好</div><div>你可以反馈 Bug、英雄平衡、皮肤想法、场景建议和新玩法。提交后会创建一条公开的项目反馈，开发者可以看到并回复。</div></div><div class="creator-note"><div class="creator-note-title">创作者的话</div><div>这款游戏还在不断成长。无论是一个小 Bug、一次“不好玩”的体验，还是一个天马行空的新想法，都欢迎告诉我。请不用担心自己的反馈不够专业——每一条认真留言，都是我继续优化《吞噬模拟器》的动力。谢谢你愿意和我一起把它做得更好。</div></div><div class="feedback-actions"><a class="btn btn-success feedback-submit" href="https://github.com/devour-simulator/devourer-simulator/issues/new?title=%5B%E6%B8%B8%E6%88%8F%E5%8F%8D%E9%A6%88%5D%20" target="_blank" rel="noopener">📝 前往提交反馈</a></div><div class="tip">需要登录 GitHub 才能提交；不要在反馈中填写密码或个人隐私信息。</div>`;
    } else {
        title.textContent = '✉️ 邮件';
        const mails = getMails();
        const unclaimed = mails.filter(mail => !mail.claimed).length;
        content.innerHTML = mails.length ? `<button class="btn btn-success" type="button" ${unclaimed ? '' : 'disabled'} onclick="claimAllMails()">🎁 一键领取${unclaimed ? `（${unclaimed}）` : ''}</button>` + mails.map((m, index) => `<div class="skill-card"><div class="skill-name">${m.system ? '系统邮件' : '好友邮件'} · ${m.title}</div><div class="skill-desc">${m.content}</div><button class="btn ${m.claimed ? '' : 'btn-success'}" type="button" ${m.claimed ? 'disabled' : ''} onclick="claimMail(${index})">${m.claimed ? '已领取' : '领取附件'}</button></div>`).join('') : '<div class="tip">暂无邮件。好友邮件需要联机服务支持。</div>';
    }
    document.getElementById('hallModal').classList.add('hidden');
    document.getElementById('subPageModal').classList.remove('hidden');
}

// 英雄图鉴只用于浏览皮肤；购买和启用皮肤都统一在商城，避免选英雄时误操作。
function openHeroSkinGallery(key) {
    const hero = ANIMALS[key], skins = HERO_SKINS[key];
    if (!isHeroReleased(hero) || !skins?.length) return;
    document.getElementById('subPageTitle').textContent = `👕 ${hero.name} · 皮肤展柜`;
    const cards = skins.filter(isSkinReleased).map(skin => {
        const how = skin.id === 'default' ? '英雄自带' : skin.battlePassOnly ? `${skin.futureSeason || 'S1'} 进阶战令 Lv.50` : skin.price ? `商城购买 · 🪙 ${skin.price}` : '特殊活动获得';
        const owned = ownsSkin(key, skin);
        const preview = heroIconMarkup(key, hero, skin);
        return `<div class="animal-card skin-gallery-card" style="--skin-color:${skin.color}"><div class="skin-preview">${preview}</div><div class="animal-name">${skin.name}</div><div class="animal-stats">获取方式：${how}${skin.themeText ? `<br>赛季主题：${skin.themeText}` : ''}<br>${owned ? '✅ 已拥有' : '🔒 未拥有'}</div></div>`;
    }).join('');
    document.getElementById('subPageContent').innerHTML = `<button class="btn" type="button" onclick="openAccountPanel('hero')">← 返回英雄图鉴</button><div class="tip">这里展示皮肤和获取方式；已拥有的皮肤可在选英雄界面切换，商城皮肤需前往商城购买。</div><div class="animals-grid">${cards}</div>`;
    document.getElementById('hallModal').classList.add('hidden');
    document.getElementById('subPageModal').classList.remove('hidden');
}
window.openHeroSkinGallery = openHeroSkinGallery;

function switchHeroRoad(tab) {
    const rank = document.getElementById('heroRoadRank');
    const level = document.getElementById('heroRoadLevel');
    if (!rank || !level) return;
    rank.style.display = tab === 'rank' ? '' : 'none';
    level.style.display = tab === 'level' ? '' : 'none';
}
function switchActivityTab(tab) {
    const daily = document.getElementById('activityDaily');
    const limited = document.getElementById('activityLimited');
    if (!daily || !limited) return;
    daily.style.display = tab === 'daily' ? '' : 'none';
    limited.style.display = tab === 'limited' ? '' : 'none';
}
window.switchActivityTab = switchActivityTab;
function switchShopTab(tab) {
    const game = document.getElementById('shopGame');
    const skin = document.getElementById('shopSkin');
    const fragment = document.getElementById('shopFragment');
    const item = document.getElementById('shopItem');
    if (!game || !skin || !fragment || !item) return;
    game.style.display = tab === 'game' ? '' : 'none';
    skin.style.display = tab === 'skin' ? '' : 'none';
    fragment.style.display = tab === 'fragment' ? '' : 'none';
    item.style.display = tab === 'item' ? '' : 'none';
}
window.switchShopTab = switchShopTab;

function confirmItemPurchase(key) {
    const item = SHOP_ITEMS[key];
    if (!item) return;
    if (!window.confirm(`确定要购买 ${item.name} 吗？\n售价：${item.price} 金币`)) return;
    if (gameState.stats.coins < item.price) return window.alert('您的金币不足！');
    gameState.stats.coins -= item.price;
    gameState.account.inventory[key] = (gameState.account.inventory[key] || 0) + 1;
    localStorage.setItem('coins', gameState.stats.coins);
    saveAccount();
    window.alert(`购买成功！获得 1 张${item.name}。`);
    openAccountPanel('shop');
    switchShopTab('item');
}
window.confirmItemPurchase = confirmItemPurchase;

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
const HUNDRED_SIGN_DEADLINE = new Date('2026-12-01T00:00:00+08:00').getTime();
const DAILY_PLAY_REWARDS = [
    { minutes:15, coins:150 }, { minutes:30, coins:250 }, { minutes:60, coins:400 },
    { minutes:90, coins:600 }, { minutes:120, coins:900 }
];
const DAILY_WEEKLY_REWARDS = [
    { day:1, label:'周一', rewards:{ coins:200 } },
    { day:2, label:'周二', rewards:{ outsideChestTicket:1 } },
    { day:3, label:'周三', rewards:{ coins:250 } },
    { day:4, label:'周四', rewards:{ coins:300 } },
    { day:5, label:'周五', rewards:{ rankProtectCard:1, rankStarCard:1 } },
    { day:6, label:'周六', rewards:{ skinChoiceChest:1 } },
    { day:0, label:'周日', rewards:{ skinChoiceChest:1 } }
];
// 固定礼包码与奖励会在活动确定后加入这里。
const GIFT_CODES = Object.freeze({});
const LIMITED_GIFT_EVENT = Object.freeze({
    id:'s1-beast-secret-2026',
    name:'万兽密令',
    start:new Date('2026-08-31T00:00:00+08:00'),
    end:new Date('2026-10-24T00:00:00+08:00'),
    tasks:[
        { id:'catKills', hero:'cat', metric:'kills', target:50, desc:'使用小猫击败 50 名敌方英雄', rewards:null },
        { id:'rabbitDamage', hero:'rabbit', metric:'damage', target:5000, desc:'使用小兔累计造成 5000 点伤害', rewards:null },
        { id:'catMatches', hero:'cat', metric:'matches', target:5, desc:'使用小猫完成 5 局对局', rewards:null },
        { id:'rabbitSummits', hero:'rabbit', metric:'summits', target:1, desc:'使用小兔在排位或进化试炼登顶 1 次', rewards:null }
    ]
});
const SKIN_CHOICE_REWARDS = { normal:20, rare:10, epic:5, mythic:3, legendary:1 };
let skinChoiceSelection = {};
const BATTLE_PASS_SEASONS = [
    {
        id:'S1', theme:'万兽启程',
        description:'森林、草原、海洋、天空与极地的英雄共同踏上第一段赛季旅程。',
        start:new Date('2026-08-24T00:00:00+08:00'), end:new Date('2026-10-24T00:00:00+08:00'),
        hero:'seasonStag', skin:{ type:'seasonStag', id:'starbloom' }
    },
    {
        id:'S2', theme:'深海觉醒',
        description:'潮汐唤醒沉睡的深海力量，海洋英雄将在暗流与雷光中迎接新的试炼。',
        start:new Date('2026-10-24T00:00:00+08:00'), end:new Date('2026-12-24T00:00:00+08:00'),
        hero:'abyssSwordfish', skin:{ type:'abyssSwordfish', id:'thunderTide' }
    }
];
function currentBattlePassSeason() {
    const now = Date.now();
    return [...BATTLE_PASS_SEASONS].reverse().find(season => now >= season.start.getTime()) || BATTLE_PASS_SEASONS[0];
}
const BATTLE_PASS_CONFIG = currentBattlePassSeason();
const BATTLE_PASS_SEASON = BATTLE_PASS_CONFIG.id;
const BATTLE_PASS_THEME = BATTLE_PASS_CONFIG.theme;
const BATTLE_PASS_LEVELS = 150;
const BATTLE_PASS_PREMIUM_PRICE = 15000;
const BATTLE_PASS_DAILY_LOGIN_EXP = 30;
const BATTLE_PASS_START_AT = BATTLE_PASS_CONFIG.start;
const BATTLE_PASS_END_AT = BATTLE_PASS_CONFIG.end;
function battlePassSeasonActive() { return Date.now() >= BATTLE_PASS_START_AT.getTime() && Date.now() < BATTLE_PASS_END_AT.getTime(); }
function battlePassDateLabel(date) {
    return new Intl.DateTimeFormat('zh-CN', { timeZone:'Asia/Shanghai', year:'numeric', month:'long', day:'numeric' }).format(date);
}
function battlePassWeekKey() {
    const now = new Date();
    const shanghai = new Date(now.toLocaleString('en-US', { timeZone:'Asia/Shanghai' }));
    const day = (shanghai.getDay() + 6) % 7;
    shanghai.setDate(shanghai.getDate() - day);
    return shanghai.toISOString().slice(0, 10);
}
function battlePassState() {
    let state;
    try { state = JSON.parse(localStorage.getItem('battlePassState') || '{}'); } catch (_) { state = {}; }
    const previousSeason = state.season || (Object.keys(state).length ? 'S1' : null);
    if (previousSeason && previousSeason !== BATTLE_PASS_SEASON) {
        localStorage.setItem(`battlePassArchive:${previousSeason}`, JSON.stringify(state));
        state = {};
    }
    applySeasonRankInheritance(BATTLE_PASS_SEASON);
    const today = dailyActivityDate(), week = battlePassWeekKey();
    if (state.dailyDate !== today) Object.assign(state, { dailyDate:today, dailyMatches:0, dailyWins:0, dailyKills:0, dailyClaimed:{} });
    if (state.weekKey !== week) Object.assign(state, { weekKey:week, weeklyMatches:0, weeklyWins:0, weeklyKills:0, weeklyPlaySeconds:0, weeklyClaimed:{} });
    state.season = BATTLE_PASS_SEASON;
    state.exp = Math.max(0, state.exp || 0);
    state.dailyMatches = Math.max(0, state.dailyMatches || 0);
    state.dailyWins = Math.max(0, state.dailyWins || 0);
    state.dailyKills = Math.max(0, state.dailyKills || 0);
    state.dailyClaimed = state.dailyClaimed || {};
    state.weeklyMatches = Math.max(0, state.weeklyMatches || 0);
    state.weeklyWins = Math.max(0, state.weeklyWins || 0);
    state.weeklyKills = Math.max(0, state.weeklyKills || 0);
    state.weeklyPlaySeconds = Math.max(0, state.weeklyPlaySeconds || 0);
    if (!state.weeklyClaimed || typeof state.weeklyClaimed !== 'object') state.weeklyClaimed = {};
    state.rewardClaims = state.rewardClaims || {};
    state.premium = !!state.premium;
    state.premiumRewardClaims = state.premiumRewardClaims || {};
    if (battlePassSeasonActive() && state.dailyLoginExpDate !== today) {
        state.dailyLoginExpDate = today;
        state.exp += BATTLE_PASS_DAILY_LOGIN_EXP;
    }
    // Lv.50 奖励从旧宝箱升级为赛季英雄后，让已领取旧奖励的玩家也能领取新英雄。
    if (BATTLE_PASS_SEASON === 'S1' && !state.seasonHeroRewardMigrated) {
        if (state.rewardClaims[50] && !ANIMALS.seasonStag.unlocked) delete state.rewardClaims[50];
        state.seasonHeroRewardMigrated = true;
    }
    localStorage.setItem('battlePassState', JSON.stringify(state));
    return state;
}
function saveBattlePassState(state) { localStorage.setItem('battlePassState', JSON.stringify(state)); }
function battlePassLevel(state = battlePassState()) { return Math.min(BATTLE_PASS_LEVELS, Math.floor(state.exp / 100) + 1); }
function trackBattlePassKill() { if (!battlePassSeasonActive()) return; const state = battlePassState(); state.dailyKills++; state.weeklyKills++; saveBattlePassState(state); }
function trackBattlePassMatch(won) { if (!battlePassSeasonActive()) return; const state = battlePassState(); state.dailyMatches++; state.weeklyMatches++; if (won) { state.dailyWins++; state.weeklyWins++; } saveBattlePassState(state); }
function trackBattlePassPlayTime(seconds) {
    if (!seconds || !battlePassSeasonActive()) return;
    const state = battlePassState();
    state.weeklyPlaySeconds += seconds;
    saveBattlePassState(state);
}
function battlePassTasks(state = battlePassState()) {
    return [
        { key:'match', group:'每日', name:'完成 1 局对战', progress:state.dailyMatches, target:1, exp:60 },
        { key:'dailyWin', group:'每日', name:'赢得 1 局对战', progress:state.dailyWins, target:1, exp:80 },
        { key:'kill', group:'每日', name:'击败 15 名敌人', progress:state.dailyKills, target:15, exp:80 },
        { key:'time', group:'每日', name:'游玩 10 分钟', progress:Math.floor(dailyPlaySeconds() / 60), target:10, exp:80 },
        { key:'weeklyMatch', group:'每周', name:'完成 10 局对战', progress:state.weeklyMatches, target:10, exp:300, weekly:true },
        { key:'weeklyWin', group:'每周', name:'赢得 5 局对战', progress:state.weeklyWins, target:5, exp:400, weekly:true },
        { key:'weeklyKill', group:'每周', name:'击败 2500 名敌人', progress:state.weeklyKills, target:2500, exp:900, weekly:true },
        { key:'weeklyTime', group:'每周', name:'累计游玩 120 分钟', progress:Math.floor(state.weeklyPlaySeconds / 60), target:120, exp:450, weekly:true }
    ];
}
function battlePassClaimableCount(state = battlePassState()) {
    let count = 0;
    if (battlePassSeasonActive()) {
        battlePassTasks(state).forEach(task => {
            const claimed = task.weekly ? state.weeklyClaimed[task.key] : state.dailyClaimed[task.key];
            if (!claimed && task.progress >= task.target) count++;
        });
    }
    const level = battlePassLevel(state);
    for (let tier = 1; tier <= level; tier++) {
        if (!state.rewardClaims[tier]) count++;
        if (state.premium && !state.premiumRewardClaims[tier]) count++;
    }
    return count;
}
function activityClaimableCount() {
    const claims = dailyPlayClaims();
    const played = dailyPlaySeconds();
    const playRewards = DAILY_PLAY_REWARDS.reduce((count, reward, index) => count + (!claims.includes(index) && played >= reward.minutes * 60 ? 1 : 0), 0);
    const dailySign = localStorage.getItem('weeklyDailySignDate') === dailyActivityDate() ? 0 : 1;
    const limitedCodes = limitedGiftClaimableCount();
    return playRewards + dailySign + limitedCodes;
}
function updateHallBadge(id, count) {
    const badge = document.getElementById(id);
    if (!badge) return;
    badge.hidden = count <= 0;
    badge.textContent = count > 99 ? '99+' : String(count);
}
function claimBattlePassTask(key) {
    const state = battlePassState();
    const task = battlePassTasks(state).find(item => item.key === key);
    if (!task || !battlePassSeasonActive() || (task.weekly ? state.weeklyClaimed[key] : state.dailyClaimed[key]) || task.progress < task.target) return;
    state.exp += task.exp;
    if (task.weekly) state.weeklyClaimed[key] = true; else state.dailyClaimed[key] = true;
    saveBattlePassState(state);
    window.alert(`战令经验 +${task.exp}！`);
    openAccountPanel('battlePass');
}
function battlePassReward(level) {
    if (level === 50) return { hero:BATTLE_PASS_CONFIG.hero };
    if (level % 10 === 0) return { skinChoiceChest:1 };
    if (level % 5 === 0) return { outsideChestTicket:1, coins:500 };
    if (level % 4 === 0) return { rankStarCard:1, rankProtectCard:1 };
    if (level % 3 === 0) return { skinFragments:{ rare:5 } };
    if (level % 2 === 0) return { skinFragments:{ normal:10 } };
    return { coins:200 + level * 30 };
}
function battlePassPremiumReward(level) {
    if (level === 50) return { skin:BATTLE_PASS_CONFIG.skin };
    if (level === 150) return { skinFragments:{ legendary:50 }, skinChoiceChest:2 };
    if (level % 10 === 0) return { skinChoiceChest:1, coins:800 };
    if (level % 5 === 0) return { skinFragments:{ epic:10 } };
    if (level % 2 === 0) return { skinFragments:{ rare:10 } };
    return { coins:300 };
}
function grantBattlePassReward(reward) {
    if (reward.coins) { gameState.stats.coins += reward.coins; localStorage.setItem('coins', gameState.stats.coins); }
    if (reward.rankStarCard) gameState.account.inventory.rankStarCard = (gameState.account.inventory.rankStarCard || 0) + reward.rankStarCard;
    if (reward.rankProtectCard) gameState.account.inventory.rankProtectCard = (gameState.account.inventory.rankProtectCard || 0) + reward.rankProtectCard;
    if (reward.outsideChestTicket) gameState.account.inventory.outsideChestTicket = (gameState.account.inventory.outsideChestTicket || 0) + reward.outsideChestTicket;
    if (reward.skinChoiceChest) gameState.account.inventory.skinChoiceChest = (gameState.account.inventory.skinChoiceChest || 0) + reward.skinChoiceChest;
    if (reward.hero && ANIMALS[reward.hero]) { ANIMALS[reward.hero].unlocked = true; saveUnlockedHeroes(); }
    if (reward.skin) {
        const skin = HERO_SKINS[reward.skin.type]?.find(item => item.id === reward.skin.id);
        if (skin) { const owned = ownedSkinKeys(); owned.add(skinKey(reward.skin.type, reward.skin.id)); localStorage.setItem('ownedSkins', JSON.stringify([...owned])); }
    }
    addSkinFragments(reward);
}
function mergeBattlePassReward(total, reward) {
    ['coins','rankStarCard','rankProtectCard','outsideChestTicket','skinChoiceChest'].forEach(key => { if (reward[key]) total[key] = (total[key] || 0) + reward[key]; });
    Object.entries(reward.skinFragments || {}).forEach(([rarity, amount]) => total.skinFragments[rarity] = (total.skinFragments[rarity] || 0) + amount);
    if (reward.hero && ANIMALS[reward.hero]) total.special.push(`${ANIMALS[reward.hero].emoji} ${ANIMALS[reward.hero].name}`);
    if (reward.skin) { const skin = HERO_SKINS[reward.skin.type]?.find(item => item.id === reward.skin.id); if (skin) total.special.push(`🎨 ${skin.name}`); }
}
function claimBattlePassReward(level, premium = false) {
    const state = battlePassState(), current = battlePassLevel(state);
    const claims = premium ? state.premiumRewardClaims : state.rewardClaims;
    if (level < 1 || level > current || claims[level] || (premium && !state.premium)) return;
    const reward = premium ? battlePassPremiumReward(level) : battlePassReward(level);
    claims[level] = true;
    grantBattlePassReward(reward);
    saveBattlePassState(state); saveAccount();
    window.alert(`战令奖励已领取！\n${rewardText(reward)}`);
    openAccountPanel('battlePass');
    if (reward.skinChoiceChest) showSkinChoiceChestPrompt(reward.skinChoiceChest);
}
function purchasePremiumBattlePass() {
    const state = battlePassState();
    if (state.premium) return window.alert('你已经解锁本赛季进阶战令。');
    if (!battlePassSeasonActive()) return window.alert(`${BATTLE_PASS_SEASON} 赛季已经结束，无法再解锁进阶战令。`);
    if (!window.confirm(`确定花费 ${BATTLE_PASS_PREMIUM_PRICE} 金币解锁 ${BATTLE_PASS_SEASON} 进阶战令吗？`)) return;
    if (gameState.stats.coins < BATTLE_PASS_PREMIUM_PRICE) return window.alert('您的金币不足！');
    gameState.stats.coins -= BATTLE_PASS_PREMIUM_PRICE;
    localStorage.setItem('coins', gameState.stats.coins);
    state.premium = true;
    saveBattlePassState(state); saveAccount();
    window.alert('进阶战令解锁成功！已经达到等级的进阶奖励现在可以领取。');
    openAccountPanel('battlePass');
}
function claimAllBattlePass() {
    const state = battlePassState();
    let taskCount = 0, taskExp = 0;
    if (battlePassSeasonActive()) {
        battlePassTasks(state).forEach(task => {
            const claimed = task.weekly ? state.weeklyClaimed[task.key] : state.dailyClaimed[task.key];
            if (claimed || task.progress < task.target) return;
            if (task.weekly) state.weeklyClaimed[task.key] = true; else state.dailyClaimed[task.key] = true;
            state.exp += task.exp; taskExp += task.exp; taskCount++;
        });
    }
    const current = battlePassLevel(state);
    const total = { skinFragments:{}, special:[] };
    let rewardCount = 0;
    for (let level = 1; level <= current; level++) {
        if (!state.rewardClaims[level]) { const reward = battlePassReward(level); state.rewardClaims[level] = true; grantBattlePassReward(reward); mergeBattlePassReward(total, reward); rewardCount++; }
        if (state.premium && !state.premiumRewardClaims[level]) { const reward = battlePassPremiumReward(level); state.premiumRewardClaims[level] = true; grantBattlePassReward(reward); mergeBattlePassReward(total, reward); rewardCount++; }
    }
    if (!taskCount && !rewardCount) return window.alert('当前没有可以一键领取的战令任务或奖励。');
    saveBattlePassState(state); saveAccount();
    const details = rewardText(total);
    window.alert(`一键领取成功！${taskCount ? `\n任务 ${taskCount} 个 · 战令经验 +${taskExp}` : ''}${rewardCount ? `\n奖励 ${rewardCount} 份\n${details}${total.special.length ? `\n${total.special.join('\n')}` : ''}` : ''}`);
    openAccountPanel('battlePass');
    if (total.skinChoiceChest) showSkinChoiceChestPrompt(total.skinChoiceChest);
}
function pendingSkinChoiceChestCount() { return Math.max(0, parseInt(localStorage.getItem('pendingSkinChoiceChest')) || 0); }
function availableSkinChoiceChestCount() { return pendingSkinChoiceChestCount() + (gameState.account.inventory.skinChoiceChest || 0); }
function dailyActivityDate() { return new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date()); }
function dailyActivityWeekday() {
    const name = new Intl.DateTimeFormat('en-US', { timeZone:'Asia/Shanghai', weekday:'short' }).format(new Date());
    return ({Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6})[name] ?? new Date().getDay();
}
function isSuperFriday() { return dailyActivityWeekday() === 5; }
function isFridayEvolution() { return isSuperFriday() && gameState.mode === 'evolution'; }
function dailyPlaySeconds() {
    return localStorage.getItem('dailyPlayDate') === dailyActivityDate() ? Math.max(0, Number(localStorage.getItem('dailyPlaySeconds')) || 0) : 0;
}
function dailyPlayClaims() {
    if (localStorage.getItem('dailyPlayClaimDate') !== dailyActivityDate()) return [];
    try { return JSON.parse(localStorage.getItem('dailyPlayClaims') || '[]'); } catch (_) { return []; }
}
function addDailyPlayTime(seconds) {
    if (!seconds || gameState.mode === 'tutorial' || gameState.mode === 'skinTrial') return;
    const today = dailyActivityDate();
    if (localStorage.getItem('dailyPlayDate') !== today) {
        localStorage.setItem('dailyPlayDate', today);
        localStorage.setItem('dailyPlaySeconds', '0');
        localStorage.removeItem('dailyPlayClaims');
        localStorage.removeItem('dailyPlayClaimDate');
    }
    const pending = (gameState.dailyPlayPendingSeconds || 0) + seconds;
    gameState.dailyPlayPendingSeconds = pending;
    if (pending >= 1) {
        const wholeSeconds = Math.floor(pending);
        localStorage.setItem('dailyPlaySeconds', String(dailyPlaySeconds() + wholeSeconds));
        trackBattlePassPlayTime(wholeSeconds);
        gameState.dailyPlayPendingSeconds = pending - wholeSeconds;
    }
}
function claimDailyPlayReward(index) {
    const reward = DAILY_PLAY_REWARDS[index];
    const claims = dailyPlayClaims();
    if (!reward || claims.includes(index) || dailyPlaySeconds() < reward.minutes * 60) return;
    claims.push(index);
    localStorage.setItem('dailyPlayClaimDate', dailyActivityDate());
    localStorage.setItem('dailyPlayClaims', JSON.stringify(claims));
    sendRewardMail(`日常活动 · 游玩 ${reward.minutes} 分钟`, `游玩时长奖励已送达，请在邮件中手动领取。`, { coins:reward.coins });
    openAccountPanel('activity');
}
function claimWeeklyDailySign() {
    const today = dailyActivityDate();
    if (localStorage.getItem('weeklyDailySignDate') === today) return window.alert('今天已经签到过了，明天 00:00 再来吧！');
    const reward = DAILY_WEEKLY_REWARDS.find(item => item.day === dailyActivityWeekday());
    localStorage.setItem('weeklyDailySignDate', today);
    sendRewardMail(`日常签到 · ${reward.label}`, `${reward.label}签到奖励已送达，请在邮件中手动领取。`, reward.rewards);
    openAccountPanel('activity');
}
function redeemedGiftCodes() {
    try {
        const codes = JSON.parse(localStorage.getItem('redeemedGiftCodes') || '[]');
        return new Set(Array.isArray(codes) ? codes.map(code => String(code)) : []);
    } catch (_) { return new Set(); }
}
function setGiftCodeStatus(message, success = false) {
    const status = document.getElementById('giftCodeStatus');
    if (!status) return;
    status.textContent = message;
    status.style.color = success ? '#16864b' : '#c53f3f';
}
function redeemGiftCode(event) {
    event?.preventDefault();
    const input = document.getElementById('giftCodeInput');
    const code = String(input?.value || '').trim();
    if (!code) return setGiftCodeStatus('请先输入礼包码。');
    const redeemed = redeemedGiftCodes();
    if (redeemed.has(code)) return setGiftCodeStatus('这个礼包码已经兑换过了，无法再次兑换。');
    const gift = GIFT_CODES[code] || limitedGiftForCode(code);
    if (!gift) return setGiftCodeStatus('礼包码不存在或已经失效。');
    if (gift.pending) return setGiftCodeStatus('这个活动礼包码有效，奖励内容尚未公布，请稍后再来兑换。');
    const now = Date.now();
    if ((gift.startsAt && now < new Date(gift.startsAt).getTime()) || (gift.endsAt && now >= new Date(gift.endsAt).getTime())) return setGiftCodeStatus('礼包码不在可兑换时间内。');
    redeemed.add(code);
    localStorage.setItem('redeemedGiftCodes', JSON.stringify([...redeemed]));
    sendRewardMail(gift.title || `礼包码奖励 · ${code}`, gift.content || '礼包码兑换成功！附件奖励请手动领取。', gift.rewards || {});
    if (input) input.value = '';
    setGiftCodeStatus('兑换成功！奖励已经发送到邮件。', true);
}
window.redeemGiftCode = redeemGiftCode;
function limitedGiftEventActive() {
    const now = Date.now();
    return now >= LIMITED_GIFT_EVENT.start.getTime() && now < LIMITED_GIFT_EVENT.end.getTime();
}
function limitedGiftEventState() {
    let state;
    try { state = JSON.parse(localStorage.getItem('limitedGiftEventState') || '{}'); } catch (_) { state = {}; }
    if (state.eventId !== LIMITED_GIFT_EVENT.id) state = { eventId:LIMITED_GIFT_EVENT.id, progress:{}, codes:{} };
    state.progress = state.progress && typeof state.progress === 'object' ? state.progress : {};
    state.codes = state.codes && typeof state.codes === 'object' ? state.codes : {};
    return state;
}
function saveLimitedGiftEventState(state) { localStorage.setItem('limitedGiftEventState', JSON.stringify(state)); }
function trackLimitedGiftProgress(metric, amount = 1) {
    if (!limitedGiftEventActive() || !gameState.player || ['tutorial','skinTrial'].includes(gameState.mode) || amount <= 0) return;
    const state = limitedGiftEventState();
    let changed = false;
    LIMITED_GIFT_EVENT.tasks.forEach(task => {
        if (task.metric !== metric || task.hero !== gameState.player.type) return;
        const current = Math.max(0, Number(state.progress[task.id]) || 0);
        const next = Math.min(task.target, current + amount);
        if (next !== current) { state.progress[task.id] = next; changed = true; }
    });
    if (changed) saveLimitedGiftEventState(state);
}
function limitedGiftRandomIndex(max) {
    if (globalThis.crypto?.getRandomValues) {
        const value = new Uint32Array(1);
        globalThis.crypto.getRandomValues(value);
        return value[0] % max;
    }
    return Math.floor(Math.random() * max);
}
function generateLimitedGiftCode(state) {
    const lower = 'abcdefghijklmnopqrstuvwxyz', upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', digits = '0123456789';
    const all = lower + upper + digits;
    const existing = new Set([...Object.keys(GIFT_CODES), ...Object.values(state.codes), ...redeemedGiftCodes()]);
    for (let attempt = 0; attempt < 100; attempt++) {
        const chars = [lower[limitedGiftRandomIndex(lower.length)], upper[limitedGiftRandomIndex(upper.length)], digits[limitedGiftRandomIndex(digits.length)]];
        while (chars.length < 8) chars.push(all[limitedGiftRandomIndex(all.length)]);
        for (let index = chars.length - 1; index > 0; index--) {
            const swap = limitedGiftRandomIndex(index + 1);
            [chars[index], chars[swap]] = [chars[swap], chars[index]];
        }
        const code = chars.join('');
        if (!existing.has(code)) return code;
    }
    return null;
}
function claimLimitedGiftCode(taskId) {
    if (!limitedGiftEventActive()) return window.alert('本期限时活动已经结束。');
    const task = LIMITED_GIFT_EVENT.tasks.find(item => item.id === taskId);
    const state = limitedGiftEventState();
    if (!task || (Number(state.progress[taskId]) || 0) < task.target) return window.alert('任务还没有完成。');
    if (!state.codes[taskId]) {
        const code = generateLimitedGiftCode(state);
        if (!code) return window.alert('兑换码生成失败，请稍后再试。');
        state.codes[taskId] = code;
        saveLimitedGiftEventState(state);
    }
    window.alert(`兑换码领取成功！\n${state.codes[taskId]}\n请注意区分英文字母大小写。`);
    openAccountPanel('activity');
}
function limitedGiftForCode(code) {
    const state = limitedGiftEventState();
    const taskId = Object.keys(state.codes).find(id => state.codes[id] === code);
    const task = LIMITED_GIFT_EVENT.tasks.find(item => item.id === taskId);
    if (!task) return null;
    return {
        title:`限时活动礼包 · ${LIMITED_GIFT_EVENT.name}`,
        content:`完成任务“${task.desc}”获得的礼包码奖励，请手动领取附件。`,
        rewards:task.rewards || {},
        pending:task.rewards === null
    };
}
function limitedGiftMetricLabel(task, value) {
    if (task.metric === 'damage') return `${Math.floor(value)}/${task.target} 点`;
    if (task.metric === 'kills') return `${Math.floor(value)}/${task.target} 名`;
    if (task.metric === 'matches') return `${Math.floor(value)}/${task.target} 局`;
    return `${Math.floor(value)}/${task.target} 次`;
}
function limitedGiftEventMarkup() {
    const state = limitedGiftEventState();
    const active = limitedGiftEventActive();
    const nextSeason = BATTLE_PASS_SEASONS.find(season => season.id === 'S2');
    const previewHero = ANIMALS[nextSeason.hero];
    const previewDefaultSkin = HERO_SKINS[nextSeason.hero].find(skin => skin.id === 'default');
    const previewSkin = HERO_SKINS[nextSeason.skin.type].find(skin => skin.id === nextSeason.skin.id);
    const previewStatus = Date.now() < nextSeason.start.getTime() ? '即将开启' : Date.now() < nextSeason.end.getTime() ? '正在进行' : '已结束';
    const seasonPreview = `<div class="feedback-box" style="background:linear-gradient(135deg,rgba(10,48,91,.96),rgba(39,27,103,.96));border-color:#52c8ff;box-shadow:0 0 24px rgba(63,174,255,.24)"><div class="feedback-heading" style="color:#aeeaff">🌊 S2 新赛季预告 · ${nextSeason.theme}</div><div>${nextSeason.description}</div><div>赛季时间：${battlePassDateLabel(nextSeason.start)}—${battlePassDateLabel(nextSeason.end)} · ${previewStatus}</div><div class="tip">预告试玩只用于体验新英雄和皮肤，不会提前解锁英雄、皮肤或战令奖励，也不会影响段位和存档。</div></div><div class="animals-grid"><div class="animal-card" style="border-color:#d64b51;background:linear-gradient(160deg,rgba(21,55,91,.96),rgba(21,28,68,.96))"><div class="animal-emoji">${heroIconMarkup(nextSeason.hero, previewHero, previewDefaultSkin)}</div><h3>${previewHero.name} ${heroRarityMarkup(previewHero)}</h3><p>免费战令 Lv.50 英雄<br>提前体验深海冲刺与潮汐力量</p><button class="btn btn-primary" type="button" onclick="startSkinTrial('${nextSeason.hero}','default',true)">试玩新英雄</button></div><div class="animal-card" style="border-color:${SKIN_RARITY_INFO[skinRarity(previewSkin)].color};background:linear-gradient(160deg,rgba(31,34,102,.96),rgba(12,59,105,.96));box-shadow:0 0 20px rgba(80,191,255,.2)"><div class="animal-emoji">${heroIconMarkup(nextSeason.skin.type, previewHero, previewSkin)}</div><h3>${previewSkin.name} ${skinRarityMarkup(previewSkin)}</h3><p>进阶战令 Lv.50 史诗皮肤<br>体验雷光配色与专属技能特效</p><button class="btn btn-primary" type="button" onclick="startSkinTrial('${nextSeason.skin.type}','${nextSeason.skin.id}',true)">试玩赛季皮肤</button></div></div>`;
    const taskCards = LIMITED_GIFT_EVENT.tasks.map(task => {
        const hero = ANIMALS[task.hero], progress = Math.min(task.target, Math.max(0, Number(state.progress[task.id]) || 0));
        const complete = progress >= task.target, code = state.codes[task.id];
        const codePanel = code ? `<div class="earned-gift-code">${code}</div><button class="btn" type="button" onclick="copyLimitedGiftCode('${code}')">📋 复制兑换码</button>` : `<button class="btn ${complete ? 'btn-success' : ''}" type="button" ${!active || !complete ? 'disabled' : ''} onclick="claimLimitedGiftCode('${task.id}')">${complete ? '领取随机兑换码' : '任务进行中'}</button>`;
        return `<div class="skill-card"><div class="skill-name">${hero.emoji} ${task.desc}</div><div class="skill-desc">进度：${limitedGiftMetricLabel(task, progress)}<br>兑换码由大小写英文字母和数字随机组成，共 8 位。</div>${codePanel}</div>`;
    }).join('');
    const formatter = new Intl.DateTimeFormat('zh-CN', { timeZone:'Asia/Shanghai', year:'numeric', month:'long', day:'numeric' });
    return `${seasonPreview}<div class="feedback-box"><div class="feedback-heading">🔐 S1 限时活动 · ${LIMITED_GIFT_EVENT.name}</div><div>使用指定英雄完成挑战即可领取专属随机礼包码。每个任务只能领取一个码，刷新或退出不会丢失。</div><div>活动时间：${formatter.format(LIMITED_GIFT_EVENT.start)}—${formatter.format(LIMITED_GIFT_EVENT.end)} · ${active ? '正在进行' : '已结束'}</div><div class="tip">兑换码严格区分大小写；当前礼包奖励内容待公布，兑换码可以先领取并保存在存档中。</div></div>${taskCards}`;
}
function limitedGiftClaimableCount() {
    if (!limitedGiftEventActive()) return 0;
    const state = limitedGiftEventState();
    return LIMITED_GIFT_EVENT.tasks.reduce((count, task) => count + ((Number(state.progress[task.id]) || 0) >= task.target && !state.codes[task.id] ? 1 : 0), 0);
}
async function copyLimitedGiftCode(code) {
    try { await navigator.clipboard.writeText(code); window.alert(`已复制兑换码：${code}`); }
    catch (_) { window.prompt('请复制这个兑换码：', code); }
}
window.claimLimitedGiftCode = claimLimitedGiftCode;
window.copyLimitedGiftCode = copyLimitedGiftCode;
function selectedSkinChoiceCount() { return Object.values(skinChoiceSelection).reduce((sum, count) => sum + (count || 0), 0); }
function adjustSkinChoiceSelection(rarity, delta) {
    const chests = availableSkinChoiceChestCount();
    const current = skinChoiceSelection[rarity] || 0;
    if (delta > 0 && selectedSkinChoiceCount() >= chests) return;
    skinChoiceSelection[rarity] = Math.max(0, current + delta);
    openAccountPanel('skinChoiceChest');
}
function confirmSkinChoiceSelection() {
    const pending = pendingSkinChoiceChestCount();
    const chests = availableSkinChoiceChestCount();
    const selected = selectedSkinChoiceCount();
    if (!chests) return;
    if (selected !== chests) return window.alert(`请先选择 ${chests} 份奖励（当前已选择 ${selected} 份）。`);
    const gained = {};
    Object.entries(skinChoiceSelection).forEach(([rarity, count]) => {
        if (!count) return;
        const amount = SKIN_CHOICE_REWARDS[rarity] * count;
        gameState.account.inventory[`fragment_${rarity}`] = (gameState.account.inventory[`fragment_${rarity}`] || 0) + amount;
        gained[rarity] = amount;
    });
    const pendingSpent = Math.min(pending, selected);
    const inventorySpent = selected - pendingSpent;
    const pendingLeft = pending - pendingSpent;
    if (pendingLeft) localStorage.setItem('pendingSkinChoiceChest', String(pendingLeft));
    else localStorage.removeItem('pendingSkinChoiceChest');
    gameState.account.inventory.skinChoiceChest = Math.max(0, (gameState.account.inventory.skinChoiceChest || 0) - inventorySpent);
    skinChoiceSelection = {};
    saveAccount();
    window.alert(`皮肤碎片自选宝箱已开启！\n${rewardText({ skinFragments:gained })}`);
    openAccountPanel('bag');
}
function skinChoicePickerMarkup() {
    const chests = availableSkinChoiceChestCount();
    const chosen = selectedSkinChoiceCount();
    const rewardCards = Object.entries(SKIN_CHOICE_REWARDS).map(([rarity, amount]) => {
        const info = SKIN_RARITY_INFO[rarity], count = skinChoiceSelection[rarity] || 0;
        return `<div class="skin-choice-card" style="--choice-color:${info.color}"><div style="font-size:38px;filter:drop-shadow(0 0 8px ${info.color})">🎁</div><div style="color:${info.color};font-weight:800">${info.label}奖励</div><div style="color:#fff;margin:6px 0">碎片 ×${amount}</div><div class="skin-choice-controls"><button class="btn" type="button" ${count ? '' : 'disabled'} onclick="adjustSkinChoiceSelection('${rarity}',-1)">−</button><strong style="color:#fff">${count}</strong><button class="btn btn-primary" type="button" ${chosen >= chests ? 'disabled' : ''} onclick="adjustSkinChoiceSelection('${rarity}',1)">＋</button></div></div>`;
    }).join('');
    return `<div class="skill-card" style="background:linear-gradient(160deg,#10224e,#1a3d78);border:1px solid #4f9cff"><div class="skill-name" style="color:#dbeeff">🎀 皮肤碎片自选宝箱</div><div class="skill-desc" style="color:#c8dcff">请从以下奖励中选择 ${chests} 份。可以全部选同一种，也可以分开选不同品质。</div><div class="skin-choice-grid">${rewardCards}</div><div style="text-align:center;color:#fff;font-weight:800;margin:10px 0">已选择 ${chosen}/${chests} 份</div><button class="btn btn-success" type="button" ${chests && chosen === chests ? '' : 'disabled'} onclick="confirmSkinChoiceSelection()">确认领取奖励</button></div>`;
}
function showSkinChoiceChestPrompt(count = gameState.account.inventory.skinChoiceChest || 0) {
    if (!count) return;
    const label = document.getElementById('skinChoiceChestPromptText');
    if (label) label.textContent = `获得皮肤碎片自选宝箱 ×${count}！要立即开启吗？`;
    document.getElementById('skinChoiceChestPrompt').classList.remove('hidden');
}
function deferSkinChoiceChest() { document.getElementById('skinChoiceChestPrompt').classList.add('hidden'); }
function openSkinChoiceChestFromBag() {
    if (!availableSkinChoiceChestCount()) return window.alert('背包里没有皮肤碎片自选宝箱。');
    skinChoiceSelection = {};
    openAccountPanel('skinChoiceChest');
}
function openSkinChoiceChestNow() {
    const count = availableSkinChoiceChestCount();
    if (!count) return deferSkinChoiceChest();
    skinChoiceSelection = {};
    deferSkinChoiceChest();
    openAccountPanel('skinChoiceChest');
}
window.claimDailyPlayReward = claimDailyPlayReward;
window.claimWeeklyDailySign = claimWeeklyDailySign;
window.adjustSkinChoiceSelection = adjustSkinChoiceSelection;
window.confirmSkinChoiceSelection = confirmSkinChoiceSelection;
window.showSkinChoiceChestPrompt = showSkinChoiceChestPrompt;
window.deferSkinChoiceChest = deferSkinChoiceChest;
window.openSkinChoiceChestFromBag = openSkinChoiceChestFromBag;
window.openSkinChoiceChestNow = openSkinChoiceChestNow;
window.claimBattlePassTask = claimBattlePassTask;
window.claimBattlePassReward = claimBattlePassReward;
window.purchasePremiumBattlePass = purchasePremiumBattlePass;
window.claimAllBattlePass = claimAllBattlePass;
const OUTSIDE_CHEST_TIERS = [
    { name:'普通宝箱', icon:'📦', color:'#8090a5', chance:.72, rewards:{ coins:120 } },
    { name:'稀有宝箱', icon:'🟦', color:'#3488df', chance:.56, rewards:{ coins:320 } },
    { name:'史诗宝箱', icon:'🟪', color:'#8753cf', chance:.38, rewards:{ coins:720, rankStarCard:1 } },
    { name:'神话宝箱', icon:'🔴', color:'#d64b51', chance:.22, rewards:{ coins:1400, rankStarCard:1, rankProtectCard:1 } },
    { name:'传说宝箱', icon:'🌈', color:'#d88722', chance:0, rewards:{ coins:2800, rankStarCard:1, rankProtectCard:1 } }
];
function outsideChestDate() { return new Date().toDateString(); }
function outsideChestState() {
    const today = outsideChestDate();
    const ticketRun = localStorage.getItem('outsideChestTicketRunDate') === today;
    return {
        taps: localStorage.getItem('outsideChestDate') === today ? Math.min(4, parseInt(localStorage.getItem('outsideChestTaps')) || 0) : 0,
        tier: localStorage.getItem('outsideChestDate') === today ? Math.max(0, Math.min(4, parseInt(localStorage.getItem('outsideChestTier')) || 0)) : 0,
        ready: localStorage.getItem('outsideChestReadyDate') === today,
        claimed: localStorage.getItem('outsideChestClaimDate') === today && !ticketRun,
        ticketRun,
        rewards: localStorage.getItem('outsideChestRewardDate') === today ? JSON.parse(localStorage.getItem('outsideChestRewards') || 'null') : null
    };
}
function rollOutsideChestRewards(tierIndex) {
    const base = { ...OUTSIDE_CHEST_TIERS[tierIndex].rewards, skinFragments:{} };
    const add = (rarity, amount) => base.skinFragments[rarity] = amount;
    const roll = Math.random();
    if (tierIndex <= 1) roll < .76 ? add('normal', tierIndex ? 7 + Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 3)) : add('epic', tierIndex ? 2 : 1);
    else if (tierIndex === 2) roll < .78 ? add('epic', 7 + Math.floor(Math.random() * 4)) : add('mythic', 1 + Math.floor(Math.random() * 2));
    else if (tierIndex === 3) roll < .78 ? add('mythic', 8 + Math.floor(Math.random() * 5)) : add('legendary', 1 + Math.floor(Math.random() * 2));
    else if (roll < .54) add('legendary', 10 + Math.floor(Math.random() * 5));
    else if (roll < .82) add('mythic', 18 + Math.floor(Math.random() * 8));
    else if (roll < .95) add('epic', 28 + Math.floor(Math.random() * 10));
    else add('normal', 46 + Math.floor(Math.random() * 16));
    return base;
}
function saveOutsideChestState(state) {
    localStorage.setItem('outsideChestDate', outsideChestDate());
    localStorage.setItem('outsideChestTaps', state.taps);
    localStorage.setItem('outsideChestTier', state.tier);
}
function renderOutsideChest() {
    const state = outsideChestState(), tier = OUTSIDE_CHEST_TIERS[state.tier];
    const icon = document.getElementById('outsideChestIcon'), tierLabel = document.getElementById('outsideChestTier');
    const text = document.getElementById('outsideChestText'), tap = document.getElementById('outsideChestTap'), claim = document.getElementById('outsideChestClaim');
    if (!icon || !tierLabel || !text || !tap || !claim) return;
    if (state.claimed) { icon.classList.add('chest-done'); icon.textContent = '✅'; }
    else {
        icon.classList.remove('chest-done');
        icon.innerHTML = `<div class="chest-lid"></div><div class="chest-body"></div><div class="chest-lock"></div><span class="chest-spark a">✦</span><span class="chest-spark b">✦</span><span class="chest-spark c">✦</span>`;
        icon.style.setProperty('--chest-color', tier.color);
        icon.style.setProperty('--chest-light', tier.color);
    }
    tierLabel.textContent = state.claimed ? '今日宝箱已领取' : tier.name;
    tierLabel.style.background = tier.color;
    text.textContent = state.claimed ? '明天再来开启新的局外奖励宝箱吧！' : state.ready ? `最终品质：${tier.name}！请领取你的奖励。` : `已敲击 ${state.taps}/4 次。每次都有机会升级；第 4 次后展示最终品质。`;
    tap.hidden = state.ready;
    tap.disabled = state.claimed || state.ready;
    tap.textContent = state.claimed ? '今日已领取' : `✨ 敲击宝箱（${state.taps + 1}/4）`;
    claim.hidden = !state.ready || state.claimed;
}
function openOutsideChest() {
    const state = outsideChestState();
    // 免费的今日宝箱已领取后，直接停留在大厅显示状态；不会再弹出已完成页面。
    if (state.claimed && (gameState.account.inventory.outsideChestTicket || 0) <= 0) {
        showHall();
        return;
    }
    // 每日免费宝箱已领完时，背包里的宝箱券可以额外开启一轮完整挑战。
    if (state.claimed && (gameState.account.inventory.outsideChestTicket || 0) > 0) {
        gameState.account.inventory.outsideChestTicket--;
        saveAccount();
        localStorage.setItem('outsideChestTicketRunDate', outsideChestDate());
        localStorage.setItem('outsideChestDate', outsideChestDate());
        localStorage.setItem('outsideChestTaps', '0');
        localStorage.setItem('outsideChestTier', '0');
        localStorage.removeItem('outsideChestReadyDate');
        localStorage.removeItem('outsideChestRewardDate');
        localStorage.removeItem('outsideChestRewards');
    }
    renderOutsideChest();
    document.getElementById('outsideChestModal').classList.remove('hidden');
}
window.openOutsideChest = openOutsideChest;
function grantOutsideChestReward(tier, viaMail = false, rewards = tier.rewards) {
    if (viaMail) {
        sendRewardMail('局外奖励宝箱结算', `你中途离开了宝箱挑战，系统按当前的「${tier.name}」为你结算了奖励，请手动领取。`, rewards);
        return;
    }
    gameState.stats.coins += rewards.coins || 0;
    if (rewards.rankStarCard) gameState.account.inventory.rankStarCard = (gameState.account.inventory.rankStarCard || 0) + rewards.rankStarCard;
    if (rewards.rankProtectCard) gameState.account.inventory.rankProtectCard = (gameState.account.inventory.rankProtectCard || 0) + rewards.rankProtectCard;
    addSkinFragments(rewards);
    localStorage.setItem('coins', gameState.stats.coins);
    saveAccount();
    window.alert(`🎁 ${tier.name}开启成功！\n${rewardText(rewards)}`);
}
function claimOutsideChest() {
    const state = outsideChestState();
    if (!state.ready || state.claimed) return;
    localStorage.setItem('outsideChestClaimDate', outsideChestDate());
    if (state.ticketRun) localStorage.removeItem('outsideChestTicketRunDate');
    grantOutsideChestReward(OUTSIDE_CHEST_TIERS[state.tier], false, state.rewards || rollOutsideChestRewards(state.tier));
    document.getElementById('outsideChestModal').classList.add('hidden');
    showHall();
}
function settleOutsideChestOnExit() {
    const state = outsideChestState();
    if (state.claimed || state.taps <= 0) return;
    localStorage.setItem('outsideChestClaimDate', outsideChestDate());
    if (state.ticketRun) localStorage.removeItem('outsideChestTicketRunDate');
    grantOutsideChestReward(OUTSIDE_CHEST_TIERS[state.tier], true, state.rewards || rollOutsideChestRewards(state.tier));
}
function tapOutsideChest() {
    const state = outsideChestState();
    if (state.claimed) return;
    state.taps++;
    const current = OUTSIDE_CHEST_TIERS[state.tier];
    let upgraded = false;
    if (state.tier < OUTSIDE_CHEST_TIERS.length - 1 && Math.random() < current.chance) { state.tier++; upgraded = true; }
    saveOutsideChestState(state);
    if (state.taps >= 4) {
        localStorage.setItem('outsideChestReadyDate', outsideChestDate());
        const rewards = rollOutsideChestRewards(state.tier);
        localStorage.setItem('outsideChestRewardDate', outsideChestDate());
        localStorage.setItem('outsideChestRewards', JSON.stringify(rewards));
        renderOutsideChest();
    } else {
        renderOutsideChest();
        document.getElementById('outsideChestText').textContent = upgraded ? `✨ 升级成功！现在是${OUTSIDE_CHEST_TIERS[state.tier].name}，还可继续敲击。` : `品质暂时保持在${current.name}，还可继续敲击。`;
    }
}
function claimHundredSignIn() {
    const today = new Date().toDateString();
    if ((parseInt(localStorage.getItem('signDay')) || 0) < 7) return window.alert('请先完成新手七日签到。');
    if (Date.now() >= HUNDRED_SIGN_DEADLINE) return window.alert('百天签到已于 2026 年 12 月 1 日 00:00 截止。');
    const currentDay = Math.min(100, parseInt(localStorage.getItem('hundredSignDay')) || 0);
    if (currentDay >= 100 || localStorage.getItem('hundredSignDate') === today) return;
    const day = currentDay + 1;
    const specialRewards = {
        2:{ coins:500 }, 7:{ coins:1200, rankStarCard:1 }, 10:{ coins:1500, rankProtectCard:1 },
        18:{ coins:2000, rankStarCard:1 }, 25:{ coins:3000, rankProtectCard:1 },
        50:{ outsideChestTicket:1 }, 75:{ outsideChestTicket:1 },
        100:{ outsideChestTicket:1 }
    };
    const rewards = specialRewards[day] || { coins:150 };
    localStorage.setItem('hundredSignDate', today);
    localStorage.setItem('hundredSignDay', String(day));
    const special = !!specialRewards[day];
    sendRewardMail(`百天签到 · 第 ${day} 天`, special ? `第 ${day} 天特别奖励已送达，请在邮件中手动领取。` : '签到奖励：150 金币，请在邮件中手动领取。', rewards);
    showHall();
}

function buyHero(key) {
    const hero = ANIMALS[key];
    if (hero.unlocked || hero.rewardOnly || gameState.stats.coins < hero.price) return false;
    gameState.stats.coins -= hero.price;
    localStorage.setItem('coins', gameState.stats.coins);
    hero.unlocked = true;
    saveUnlockedHeroes();
    if (gameState.screen === 'select') showAnimalSelection();
    return true;
}

function confirmPurchase(key) {
    const hero = ANIMALS[key];
    if (!hero || hero.unlocked || hero.signOnly || hero.rewardOnly) return;
    if (!window.confirm(`确定要购买 ${hero.name} 吗？\n售价：${hero.price} 金币`)) return;
    if (gameState.stats.coins < hero.price) return window.alert('您的金币不足！');
    buyHero(key);
    window.alert('购买成功！');
    openAccountPanel('shop');
}

function chooseMode(mode, acknowledgedTeamNotice = false) {
    if (mode === 'team' && !acknowledgedTeamNotice && localStorage.getItem('hideTeamModeUpdateNotice') !== '1') {
        document.getElementById('teamUpdateModal').classList.remove('hidden');
        return;
    }
    if (['ranked','tower','evolution'].includes(mode) && getSavedRankedRun(mode)) {
        pendingSaveMode = mode;
        document.getElementById('saveChoiceModal').classList.remove('hidden');
        return;
    }
    gameState.mode = mode;
    document.getElementById('hallModal').classList.add('hidden');
    document.getElementById('selectTitle').textContent = mode === 'ranked' ? `⚔️ 排位赛 · ${rankLabel()}` : mode === 'team' ? '👥 5v5 团队模式：选择英雄' : mode === 'evolution' ? '✨ 进化试炼：选择可觉醒英雄' : '🗼 爬塔模式：选择英雄';
    gameState.screen = 'select';
    showAnimalSelection();
}

function cancelAnimalSelection() {
    document.getElementById('selectModal').classList.add('hidden');
    gameState.screen = 'hall';
    showHall();
}

let heroSelectionSort = localStorage.getItem('heroSelectionSort') || 'low';
const HERO_QUALITY_ORDER = { normal:0, rare:1, epic:2, mythic:3, legendary:4 };
function setHeroSelectionSort(order) {
    heroSelectionSort = order === 'high' ? 'high' : 'low';
    localStorage.setItem('heroSelectionSort', heroSelectionSort);
    showAnimalSelection();
}
function showAnimalSelection() {
    const grid = document.getElementById('animalsGrid');
    grid.innerHTML = '';
    document.getElementById('heroSortLowButton').classList.toggle('btn-primary', heroSelectionSort === 'low');
    document.getElementById('heroSortHighButton').classList.toggle('btn-primary', heroSelectionSort === 'high');

    const heroEntries = gameState.mode === 'evolution'
        ? EVOLUTION_MODE_TYPES.map(key => [key, ANIMALS[key]])
        : heroesByPower();
    const sortByQuality = entries => [...entries].sort(([, a], [, b]) => {
        const quality = HERO_QUALITY_ORDER[heroRarity(a)] - HERO_QUALITY_ORDER[heroRarity(b)];
        return (heroSelectionSort === 'high' ? -quality : quality) || (heroSelectionSort === 'high' ? calculateHeroPower(b) - calculateHeroPower(a) : calculateHeroPower(a) - calculateHeroPower(b));
    });
    const renderEntries = (entries, title) => {
        if (!entries.length) return;
        const sectionTitle = document.createElement('div');
        sectionTitle.style.cssText = 'grid-column:1/-1;margin:12px 0 0;font-weight:900;color:#4c5dc7;font-size:17px';
        sectionTitle.textContent = title;
        grid.appendChild(sectionTitle);
        entries.forEach(([key, animal]) => {
        const card = document.createElement('div');
        card.className = 'animal-card';
        const abilities = ABILITIES[key];
        
        let lockedHint = '';
        if (animal.unlocked === false && gameState.mode !== 'evolution') {
            lockedHint = animal.seasonReward
                ? `📜 ${animal.futureSeason || 'S1'} 免费战令 Lv.50 领取`
                : animal.rewardOnly
                ? `❄️ ${polarUnlockCondition(key)}`
                : animal.signOnly
                ? `📅 签到专属：第 ${key === 'fox' ? 2 : 7} 天领取`
                : `🪙 ${animal.price} 金币购买<br><small>当前金币: ${gameState.stats.coins}</small>`;
        }

        card.innerHTML = `
            <div class="animal-emoji">${heroIconMarkup(key, animal, getSelectedHeroSkin(key))}</div>
            ${gameState.mode === 'evolution' ? '' : `<div>${heroRarityMarkup(animal)}</div>`}
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
        
        if (animal.unlocked === false && gameState.mode !== 'evolution') {
            card.style.opacity = '0.5';
            card.style.cursor = (animal.signOnly || animal.rewardOnly) ? 'not-allowed' : (gameState.stats.coins >= animal.price ? 'pointer' : 'not-allowed');
            if (!animal.signOnly && !animal.rewardOnly) card.onclick = () => buyHero(key);
        } else {
            card.onclick = () => startGame(key);
            if (gameState.mode === 'evolution') {
                const route = EVOLUTION_ROUTES[key];
                const evolutionHint = document.createElement('div');
                evolutionHint.className = 'tip';
                evolutionHint.textContent = `✨ Lv.${route.level} 进化：${route.name}`;
                card.appendChild(evolutionHint);
            }
            // 选英雄时只允许切换已拥有皮肤；购买仍只能在商城完成。
            const ownedSkins = (HERO_SKINS[key] || []).filter(skin => isSkinReleased(skin) && ownsSkin(key, skin));
            if (ownedSkins.length > 1) {
                const wardrobe = document.createElement('div');
                wardrobe.className = 'battle-skin-switcher';
                const selectedSkin = getSelectedHeroSkin(key);
                wardrobe.innerHTML = `<small>👕 对局皮肤</small>`;
                ownedSkins.forEach(skin => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = `battle-skin-button${selectedSkin?.id === skin.id ? ' selected' : ''}`;
                    button.style.setProperty('--skin-color', skin.color);
                    button.textContent = selectedSkin?.id === skin.id ? `✓ ${skin.name}` : skin.name;
                    button.onclick = event => {
                        event.stopPropagation();
                        localStorage.setItem(`heroSkin:${key}`, skin.id);
                        showAnimalSelection();
                    };
                    wardrobe.appendChild(button);
                });
                card.appendChild(wardrobe);
            }
        }
        
            grid.appendChild(card);
        });
    };
    if (gameState.mode === 'evolution') {
        renderEntries(sortByQuality(heroEntries), '✨ 可进化英雄');
    } else {
        renderEntries(sortByQuality(heroEntries.filter(([, animal]) => animal.unlocked)), '✅ 已拥有英雄');
        renderEntries(sortByQuality(heroEntries.filter(([, animal]) => !animal.unlocked)), '🔒 未拥有英雄');
    }
    document.getElementById('selectModal').classList.remove('hidden');
}

function startGame(animalType, savedRun = null) {
    document.getElementById('selectModal').classList.add('hidden');
    enterGameFullscreen();
    gameState.screen = 'playing';
    if (gameState.mode !== 'skinTrial') gameState.skinTrial = null;
    clearDynamic3DMeshes();
    document.getElementById('skinTrialExitButton').hidden = gameState.mode !== 'skinTrial';
    gameState.levelUpShown = false;  // 重置升级标志
    gameState.player = new Character(animalType);
    // 5V5 从场地两端出生：玩家与队友在左侧，敌方在右侧，中央据点才是首个交战点。
    if (gameState.mode === 'team') {
        gameState.player.x = 150;
        gameState.player.y = GAME_HEIGHT / 2;
        gameState.player.targetX = gameState.player.x;
        gameState.player.targetY = gameState.player.y;
    }
    if (gameState.mode === 'team') { gameState.rankItemNotice = '🏳️ 团队提示：占领我方、中央、敌方三座据点即可获胜；据点内两队同时在场会暂停占领。阵亡后 3 秒在出生点复活，并有 1.5 秒无敌。'; gameState.teamIntroTicks = 7 * TARGET_FPS; }
    gameState.enemies = [];
    gameState.particles = [];
    gameState.skillEffects = [];
    gameState.killEffects = [];
    gameState.chests = [];
    gameState.damageNumbers = [];
    gameState.provokeActive = false;
    gameState.pendingLevelUpSkills = [];
    gameState.evolutionMessage = '';
    gameState.stats.killCount = 0;
    gameState.skillRerolls = 0;
    gameState.world.level = 1;
    gameState.world.time = 0;
    gameState.environment = environmentFor(animalType);
    applySceneEnvironment();
    if (gameState.mode === 'tutorial' && gameState.environment === 'land') placeTutorialPlayerSafely(gameState.player);
    if (savedRun && ['ranked','tower','evolution'].includes(gameState.mode)) {
        const savedPlayer = savedRun.player;
        const fields = ['x','y','level','exp','expToLevel','attack','defense','speed','maxHp','hp','skills','regenBonus','critChance','comboChance','lifesteal','skillPower','activeCooldownReduction','activeCooldown','empoweredHits','empoweredDamage','shieldHits','shieldReduction','evolved'];
        fields.forEach(field => { if (savedPlayer[field] !== undefined) gameState.player[field] = savedPlayer[field]; });
        if (savedPlayer.evolved && EVOLUTION_ROUTES[gameState.player.type]) {
            const route = EVOLUTION_ROUTES[gameState.player.type];
            gameState.player.evolved = true; gameState.player.evolution = route;
            gameState.player.name = route.name; gameState.player.emoji = route.emoji; gameState.player.color = route.color;
            gameState.player.activeAbility = route.active;
        }
        gameState.player.critChance = Math.min(1, Math.max(0, gameState.player.critChance || 0));
        gameState.player.comboChance = Math.min(MAX_COMBO_CHANCE, Math.max(0, gameState.player.comboChance || 0));
        gameState.world.level = Math.max(1, savedRun.level || 1);
        gameState.world.time = Math.max(0, savedRun.time || 0);
        gameState.stats.killCount = Math.max(0, savedRun.killCount || 0);
        gameState.skillRerolls = Math.max(0, savedRun.skillRerolls || 0);
        gameState.provokeActive = !!savedRun.provokeActive;
        gameState.pendingLevelUpSkills = Array.isArray(savedRun.pendingLevelUpSkills) ? savedRun.pendingLevelUpSkills.map(name => SKILLS.find(skill => skill.name === name)).filter(Boolean) : [];
    } else if (['ranked','tower','evolution'].includes(gameState.mode)) {
        clearRankedRun();
    }
    lastFrameTime = null;
    updateControlLayout();

    if (gameState.mode === 'tutorial') spawnTutorialBattle();
    else if (gameState.mode === 'team') spawnTeamBattle();
    else if (savedRun && ['ranked','tower','evolution'].includes(gameState.mode) && Array.isArray(savedRun.enemies)) {
        gameState.enemies = restoreSavedEnemies(savedRun.enemies);
        gameState.particles = restoreSavedParticles(savedRun.particles);
        gameState.chests = Array.isArray(savedRun.chests) ? savedRun.chests.map(chest => ({ ...chest })) : [];
        if (!Array.isArray(savedRun.chests) && savedRun.chestAvailable) spawnChest();
    } else {
        spawnEnemies();
        spawnAmbientPickups();
        if (gameState.world.level === 1) spawnChest();
    }
    saveRankedRun();
    // 如果退出时正在选升级技能，继续游戏后先恢复相同的三张卡，再继续战斗。
    if (savedRun?.awaitingLevelUp) {
        gameState.screen = 'levelup';
        gameState.levelUpShown = false;
    }
    // 首帧必须由浏览器提供时间戳，避免直接调用时产生无效坐标。
    requestAnimationFrame(gameLoop);
}

function spawnEnemies() {
    gameState.enemies = [];
    gameState.allies = [];
    const isBossFloor = (gameState.mode === 'tower' || isRankProgressMode()) && gameState.world.level % 5 === 0;
    const enemyCount = isBossFloor ? 1 : Math.min(3 + gameState.world.level, 10);

    for (let i = 0; i < enemyCount; i++) {
        // 敌人可以是任何角色，不受解锁限制
        const bronzePool = ['cat', 'rabbit', 'fox', 'bear'];
        const midPool = [...bronzePool, 'tiger', 'wolf', 'deer', 'panda', 'monkey'];
        const environmentPool = gameState.environment === 'ocean' ? OCEAN_TYPES : gameState.environment === 'sky' ? SKY_TYPES : gameState.environment === 'polar' ? POLAR_TYPES : gameState.environment === 'pond' ? POND_TYPES : gameState.environment === 'savanna' ? SAVANNA_TYPES : null;
        const enemyPool = environmentPool
            ? environmentPool
            : isRankProgressMode()
            ? (gameState.world.level >= 25 ? LAND_TYPES : gameState.world.level >= 10 ? midPool : gameState.rank.tier === 0 ? bronzePool : gameState.rank.tier <= 2 ? midPool : LAND_TYPES)
            : LAND_TYPES;
        let animalType = enemyPool[Math.floor(Math.random() * enemyPool.length)];

        const edgePadding = 86;
        let x = edgePadding + Math.random() * (GAME_WIDTH - edgePadding * 2);
        let y = edgePadding + Math.random() * (GAME_HEIGHT - edgePadding * 2);

        // 确保不与玩家、树石或边界挤在一起，避免出生后直接被卡住。
        let spawnAttempts = 0;
        while (spawnAttempts++ < 80 && (Math.hypot(x - gameState.player.x, y - gameState.player.y) < 120 || (gameState.environment === 'land' && (gameState.obstacles || []).some(obstacle => Math.hypot(x - obstacle.x, y - obstacle.y) < obstacle.radius + 72)))) {
            x = edgePadding + Math.random() * (GAME_WIDTH - edgePadding * 2);
            y = edgePadding + Math.random() * (GAME_HEIGHT - edgePadding * 2);
        }

        const enemy = new Enemy(animalType, x, y);
        enemy.level = gameState.world.level;
        const rankPressure = isRankProgressMode() ? Math.max(0, gameState.world.level - 5) * 0.09 : 0;
        const scale = 1 + (gameState.world.level - 1) * (isRankProgressMode() ? 0.12 : 0.08) + rankPressure;
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

    // 5V5 与皮肤试玩阵亡后等待复活，期间不能攻击。
    if ((gameState.mode === 'team' || gameState.mode === 'skinTrial') && player.hp <= 0) return;

    // 检测玩家与敌人的碰撞（战斗）
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        if (enemy.hp <= 0) continue;
        const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);

        if (distance < player.radius + enemy.radius) {
            const enemyDefeated = attackOnce(player, enemy);
            if (!enemyDefeated && enemy.cooldown <= 0) attackOnce(enemy, player);
            if (gameState.mode === 'team' && player.hp <= 0) return;

            if (enemyDefeated) {
                // 获胜
                spawnKillEffect(enemy.x, enemy.y);
                if (gameState.mode !== 'skinTrial' && gameState.mode !== 'team') {
                    gameState.stats.killCount++;
                    trackBattlePassKill();
                    gameState.stats.coins += Math.ceil((enemy.isBoss ? 80 : 12) * (isFridayEvolution() ? 1.5 : 1));
                    localStorage.setItem('coins', gameState.stats.coins);
                    const expReward = Math.floor(10 * (1 + enemy.level * 0.5));
                    player.addExp(expReward);
                    // 生成经验粒子
                    spawnParticles(enemy.x, enemy.y, 5);
                }
                
                if (gameState.mode === 'team') markTeamDefeated(enemy);
                else gameState.enemies.splice(i, 1);

                if (gameState.enemies.length === 0) {
                    if (gameState.mode === 'tutorial') {
                        completeTutorialBattle();
                        return;
                    }
                    if (gameState.mode === 'skinTrial') {
                        queueSkinTrialOpponent();
                        return;
                    }
                    if (isRankProgressMode()) {
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
            } else if (particle.type === 'item') {
                activateChestItem(particle.itemKey);
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
    trackBattlePassMatch(won);
    trackLimitedGiftProgress('matches', 1);
    if (won && rankRewardOverride !== null && isRankProgressMode()) trackLimitedGiftProgress('summits', 1);
    const rankProgress = isRankProgressMode();
    if (rankProgress) clearRankedRun();
    if (rankProgress && won) { gameState.stats.rankWins++; localStorage.setItem('rankWins', gameState.stats.rankWins); }
    // 团队模式的单局时间较长，结算账号经验相应提高；排位经验随抵达层数显著提高。
    const baseAccountReward = gameState.mode === 'team'
        ? (won ? 50 : 20)
        : (won ? 45 + gameState.world.level * 14 : 12 + gameState.world.level * 4);
    const accountReward = isFridayEvolution() ? Math.ceil(baseAccountReward * 1.5) : baseAccountReward;
    accountExp(accountReward);
    let rankReward = 0;
    gameState.rankItemNotice = '';
    if (rankProgress) {
        const floor = gameState.world.level;
        // 排位爬塔：第 6/10/30 层分别 +1/+2/+3，50 层通关 +4；第 6 层前失败才扣星。
        if (rankRewardOverride !== null) rankReward = rankRewardOverride;
        else if (floor >= 30) rankReward = 3 + Math.floor((floor - 30) / 20);
        else if (floor >= 10) rankReward = 2;
        else if (floor >= 6) rankReward = 1;
        else rankReward = -1;
        const inventory = gameState.account.inventory;
        // 超级星期五只奖励当天第一局“排位模式”的胜利，失败时不会抵扣扣星，也不会变成保护卡。
        const fridayFirstRank = gameState.mode === 'ranked' && isSuperFriday() && localStorage.getItem('superFridayFirstRankDate') !== dailyActivityDate();
        if (fridayFirstRank) {
            localStorage.setItem('superFridayFirstRankDate', dailyActivityDate());
            if (won) {
                rankReward += 1;
                gameState.rankItemNotice = '🎉 超级星期五：当天首局排位额外 +1 星！';
            } else {
                gameState.rankItemNotice = '🎉 超级星期五首局已完成；本局失败仍按正常规则结算，不会抵扣扣星。';
            }
        }
        // 只要本局基础结算会增加星数，就自动使用加星卡；不要求必须登顶或以“胜利”状态结束。
        if (rankReward > 0 && inventory.rankStarCard > 0) {
            inventory.rankStarCard--;
            rankReward += 1;
            gameState.rankItemNotice += `${gameState.rankItemNotice ? '<br>' : ''}⭐ 已自动使用排位加星卡：额外 +1 星。`;
            saveAccount();
        } else if (!won && rankReward < 0 && inventory.rankProtectCard > 0) {
            inventory.rankProtectCard--;
            rankReward = 0;
            gameState.rankItemNotice += `${gameState.rankItemNotice ? '<br>' : ''}🛡️ 已自动使用排位保护卡：本局不扣星。`;
            saveAccount();
        }
        const times = Math.abs(rankReward);
        for (let i = 0; i < times; i++) changeRankStars(rankReward > 0 ? 1 : -1);
    }
    document.getElementById('gameOverTitle').textContent = gameState.mode === 'team' ? (won ? '🏆 团队胜利！' : '💥 团队落败') : gameState.mode === 'evolution' ? (rankRewardOverride !== null ? '✨ 进化试炼登顶！' : won ? '✨ 进化试炼胜利！' : '💥 进化试炼落败') : (rankRewardOverride !== null ? '👑 排位爬塔登顶！' : won ? '🏅 排位胜利！' : '💥 排位落败');
    document.getElementById('characterInfo').innerHTML = `本局使用：<strong>${gameState.player.name} ${gameState.player.emoji}</strong><br>击败敌人：<strong>${gameState.stats.killCount}</strong>`;
    document.getElementById('finalScore').textContent = rankProgress
        ? `${rankReward > 0 ? '+' : ''}${rankReward} 星（第 ${gameState.world.level} 层）`
        : '团队模式不影响段位星数';
    document.getElementById('rankInfo').innerHTML = gameState.mode === 'team'
        ? '本局为娱乐团队战，段位保持不变。'
        : `当前段位：<strong>${rankLabel()}</strong>${gameState.rankItemNotice ? `<br>${gameState.rankItemNotice}` : ''}`;
    document.getElementById('restartButton').textContent = '🏠 返回大厅';
    document.getElementById('gameOverModal').classList.remove('hidden');
}

function finishSkinTrial(won) {
    exitGameFullscreen();
    gameState.screen = 'gameover';
    gameState.skinTrial = null;
    document.getElementById('skinTrialExitButton').hidden = true;
    document.getElementById('gameOverTitle').textContent = won ? '🎨 皮肤试玩完成！' : '🎨 皮肤试玩结束';
    document.getElementById('characterInfo').innerHTML = '本局仅用于体验皮肤，不会获得或扣除任何奖励。';
    document.getElementById('finalScore').textContent = won ? '试玩胜利' : '试玩结束';
    document.getElementById('rankInfo').innerHTML = '返回大厅后可前往商城购买喜欢的皮肤。';
    document.getElementById('restartButton').textContent = '🏠 返回大厅';
    document.getElementById('gameOverModal').classList.remove('hidden');
}

function spawnTeamBattle() {
    // 团队战跟随玩家所选英雄的生态场景，队友与敌人都不会混进别的栖息地。
    const types = gameState.environment === 'ocean' ? OCEAN_TYPES
        : gameState.environment === 'sky' ? SKY_TYPES
        : gameState.environment === 'polar' ? POLAR_TYPES
        : gameState.environment === 'pond' ? POND_TYPES
        : gameState.environment === 'savanna' ? SAVANNA_TYPES : LAND_TYPES;
    // 两边从同一组战力档位抽取：不会再出现一边全是强势英雄、另一边都是新手英雄。
    const strength = type => calculateHeroPower(ANIMALS[type]);
    const playerPower = strength(gameState.player.type);
    // 根据玩家所选英雄挑选五个最接近的英雄：双方总战力接近，且不会一侧全是顶级英雄。
    const pairedTypes = [...types].sort((a, b) => Math.abs(strength(a) - playerPower) - Math.abs(strength(b) - playerPower)).slice(0, 5);
    const blueSpawns = [[220, 230], [220, 390], [220, 550], [300, 310]];
    const redSpawns = [[GAME_WIDTH - 220, 190], [GAME_WIDTH - 220, 330], [GAME_WIDTH - 220, 470], [GAME_WIDTH - 220, 610], [GAME_WIDTH - 300, 400]];
    for (let i = 0; i < 4; i++) {
        const [x, y] = blueSpawns[i];
        const ally = new Enemy(pairedTypes[(i + 1) % pairedTypes.length], x, y);
        ally.name = `队友·${ally.name}`; ally.team = 'blue'; ally.color = '#4ca8ff';
        gameState.allies.push(ally);
    }
    for (let i = 0; i < 5; i++) {
        const [x, y] = redSpawns[i];
        const foe = new Enemy(pairedTypes[i], x, y);
        foe.name = `敌方·${foe.name}`; foe.team = 'red'; foe.color = '#ef5350';
        gameState.enemies.push(foe);
    }
    gameState.teamObjectives = [
        { id:'blue-base', mark:'A', label:'蓝方前哨', x:260, y:GAME_HEIGHT / 2, radius:82, progress:0, owner:null },
        { id:'center', mark:'B', label:'中央据点', x:GAME_WIDTH / 2, y:GAME_HEIGHT / 2, radius:88, progress:0, owner:null },
        { id:'red-base', mark:'C', label:'红方前哨', x:GAME_WIDTH - 260, y:GAME_HEIGHT / 2, radius:82, progress:0, owner:null }
    ];
    gameState.teamPowerAwarded = false;
    gameState.teamAngelTeam = null;
    gameState.teamDemonTeam = null;
    gameState.teamOvertime = false;
    gameState.teamOvertimeStartedAt = 0;
    gameState.teamEasterEgg = null;
    gameState.teamEasterEggTimer = 35 * TARGET_FPS;
}

function teamUnits(side) {
    return side === 'blue' ? [gameState.player, ...gameState.allies] : gameState.enemies;
}

function clearTeamPowers() {
    ['blue', 'red'].forEach(side => teamUnits(side).forEach(unit => {
        if (!unit) return;
        if (unit.teamBaseAttack !== undefined) unit.attack = unit.teamBaseAttack;
        if (unit.teamBaseDefense !== undefined) unit.defense = unit.teamBaseDefense;
        unit.teamAngel = false; unit.teamDemon = false;
    }));
    gameState.teamPowerAwarded = false;
    gameState.teamAngelTeam = null;
    gameState.teamDemonTeam = null;
}

function updateTeamMinutePowers(objectives = gameState.teamObjectives || []) {
    if (gameState.mode !== 'team' || gameState.world.time < 60) return;
    const blueInvasion = objectives.reduce((sum, objective) => sum + Math.max(0, objective.progress), 0);
    const redInvasion = objectives.reduce((sum, objective) => sum + Math.max(0, -objective.progress), 0);
    // 正好平局时保持当前加持；第一次平局则暂不发放。
    if (blueInvasion === redInvasion) return;
    const angel = blueInvasion > redInvasion ? 'blue' : 'red';
    const demon = angel === 'blue' ? 'red' : 'blue';
    const hadPower = gameState.teamPowerAwarded;
    const changed = !hadPower || gameState.teamAngelTeam !== angel;
    ['blue', 'red'].forEach(side => teamUnits(side).forEach(unit => {
        if (!unit) return;
        if (unit.teamBaseAttack === undefined) unit.teamBaseAttack = unit.attack;
        if (unit.teamBaseDefense === undefined) unit.teamBaseDefense = unit.defense;
        unit.teamAngel = side === angel;
        unit.teamDemon = side === demon;
        unit.attack = Math.ceil(unit.teamBaseAttack * (unit.teamDemon ? 1.05 : 1));
        unit.defense = Math.ceil(unit.teamBaseDefense * (unit.teamDemon ? 1.05 : 1));
    }));
    gameState.teamPowerAwarded = true;
    gameState.teamAngelTeam = angel;
    gameState.teamDemonTeam = demon;
    if (!changed) return;
    const angelText = angel === 'blue' ? '我方获得天使之力：技能冷却 -20%、侵略值获取 +5%' : '敌方获得天使之力：技能冷却 -20%、侵略值获取 +5%';
    const demonText = demon === 'blue' ? '我方获得魔王之力：攻击、防御 +5%' : '敌方获得魔王之力：攻击、防御 +5%';
    gameState.rankItemNotice = `${hadPower ? '⚖️ 局势反转！' : '⏱️ 1 分钟战局加持！'}${angelText}；${demonText}`;
}

function startTeamOvertime() {
    if (gameState.teamOvertime || gameState.mode !== 'team') return;
    gameState.teamOvertime = true;
    gameState.teamOvertimeStartedAt = gameState.world.time;
    (gameState.teamObjectives || []).forEach(objective => {
        objective.visible = objective.id === 'center';
        objective.owner = null;
        objective.progress = 0;
        if (objective.id === 'center') {
            objective.mark = 'B'; objective.label = '决胜据点'; objective.radius = 104;
        }
    });
    // 加时重新从中立局面开始计算阵营加持，前 3 分钟的优势不带入决胜点。
    clearTeamPowers();
    gameState.teamEasterEgg = null;
    gameState.rankItemNotice = '⚔️ 加时决战开始！A、C 据点已消失，B 决胜据点已重置；每秒占领 10%，先占满即获胜。';
}

function resetTeamEasterEggTimer() {
    gameState.teamEasterEggTimer = (32 + Math.random() * 16) * TARGET_FPS;
}

function spawnTeamEasterEgg() {
    const points = (gameState.teamObjectives || []).filter(objective => objective.visible !== false);
    if (!points.length) return;
    const point = points[Math.floor(Math.random() * points.length)];
    const angle = Math.random() * Math.PI * 2, distance = 95 + Math.random() * 45;
    gameState.teamEasterEgg = {
        x: Math.max(70, Math.min(GAME_WIDTH - 70, point.x + Math.cos(angle) * distance)),
        y: Math.max(70, Math.min(GAME_HEIGHT - 70, point.y + Math.sin(angle) * distance)),
        radius: 58, progress: 0, life: 14 * TARGET_FPS
    };
    gameState.rankItemNotice = '🎏 神秘战旗出现！先单独守住 2 秒的一队可获得随机战术增益。';
}

function grantTeamEasterEgg(side) {
    const units = teamUnits(side).filter(unit => unit && unit.hp > 0);
    const rewards = ['rally', 'shield', 'charge'];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    if (reward === 'rally') {
        units.forEach(unit => { unit.teamRallyTicks = 8 * TARGET_FPS; });
        gameState.rankItemNotice = `${side === 'blue' ? '🔵 我方' : '🔴 敌方'}夺得神秘战旗：战意激发，8 秒内伤害 +15%！`;
    } else if (reward === 'shield') {
        units.forEach(unit => { unit.shieldHits = Math.max(unit.shieldHits || 0, 3); unit.shieldReduction = Math.max(unit.shieldReduction || 0, .35); });
        gameState.rankItemNotice = `${side === 'blue' ? '🔵 我方' : '🔴 敌方'}夺得神秘战旗：全队获得 3 次守护护盾！`;
    } else {
        units.forEach(unit => { unit.activeCooldown = 0; });
        gameState.rankItemNotice = `${side === 'blue' ? '🔵 我方' : '🔴 敌方'}夺得神秘战旗：全队技能冷却立刻完成！`;
    }
    gameState.teamEasterEgg = null;
    resetTeamEasterEggTimer();
}

function updateTeamEasterEgg(frameScale = 1) {
    if (gameState.mode !== 'team' || gameState.teamOvertime) return;
    if (!gameState.teamEasterEgg) {
        gameState.teamEasterEggTimer = Math.max(0, (gameState.teamEasterEggTimer || 0) - frameScale);
        if (gameState.teamEasterEggTimer === 0) spawnTeamEasterEgg();
        return;
    }
    const egg = gameState.teamEasterEgg;
    egg.life = Math.max(0, egg.life - frameScale);
    const nearby = unit => unit.hp > 0 && Math.hypot(unit.x - egg.x, unit.y - egg.y) <= egg.radius;
    const blue = (nearby(gameState.player) ? 1 : 0) + gameState.allies.filter(nearby).length;
    const red = gameState.enemies.filter(nearby).length;
    if (blue > 0 && red === 0) egg.progress = Math.min(100, egg.progress + frameScale * 50 / TARGET_FPS);
    else if (red > 0 && blue === 0) egg.progress = Math.max(-100, egg.progress - frameScale * 50 / TARGET_FPS);
    if (egg.progress >= 100) return grantTeamEasterEgg('blue');
    if (egg.progress <= -100) return grantTeamEasterEgg('red');
    if (egg.life === 0) { gameState.teamEasterEgg = null; resetTeamEasterEggTimer(); gameState.rankItemNotice = '🎏 神秘战旗无人夺取，已消失。'; }
}

function updateTeamObjective(frameScale = 1) {
    if (gameState.mode !== 'team' || !(gameState.teamObjectives || []).length) return;
    if (!gameState.teamOvertime && gameState.world.time >= 180) startTeamOvertime();
    const objectives = (gameState.teamObjectives || []).filter(objective => objective.visible !== false);
    if (gameState.teamIntroTicks > 0) {
        gameState.teamIntroTicks = Math.max(0, gameState.teamIntroTicks - frameScale);
        if (gameState.teamIntroTicks === 0) gameState.rankItemNotice = '';
    }
    const capturePerFrame = (gameState.teamOvertime ? 10 : 5) / TARGET_FPS;
    objectives.forEach(objective => {
        const nearby = unit => unit.hp > 0 && !unit.respawnTicks && Math.hypot(unit.x - objective.x, unit.y - objective.y) <= objective.radius;
        const blue = (nearby(gameState.player) ? 1 : 0) + gameState.allies.filter(nearby).length;
        const red = gameState.enemies.filter(nearby).length;
        // 两队都在据点中时完全暂停，不按人数多寡推进。
        if ((blue > 0 && red > 0) || (blue === 0 && red === 0)) return;
        const side = blue > 0 ? 1 : -1;
        const angelCaptureBoost = (side === 1 ? gameState.teamAngelTeam === 'blue' : gameState.teamAngelTeam === 'red') ? 1.05 : 1;
        // 已占领据点也能反抢：先以每秒 5% 清空对方侵略值，归零后才增长己方侵略值。
        if (side > 0 && objective.progress < 0) objective.progress = Math.min(0, objective.progress + capturePerFrame * angelCaptureBoost * frameScale);
        else if (side < 0 && objective.progress > 0) objective.progress = Math.max(0, objective.progress - capturePerFrame * angelCaptureBoost * frameScale);
        else objective.progress = Math.max(-100, Math.min(100, objective.progress + side * capturePerFrame * angelCaptureBoost * frameScale));
        if (objective.progress === 0) objective.owner = null;
        if (objective.progress === 100 && objective.owner !== 'blue') {
            objective.owner = 'blue';
            gameState.rankItemNotice = `🔵 我方占领了${objective.label}！`;
        } else if (objective.progress === -100 && objective.owner !== 'red') {
            objective.owner = 'red';
            gameState.rankItemNotice = `🔴 敌方占领了${objective.label}！`;
        }
    });
    if (objectives.every(objective => objective.owner === 'blue')) finishRankedMatch(true);
    else if (objectives.every(objective => objective.owner === 'red')) finishRankedMatch(false);
    else updateTeamMinutePowers(objectives);
}

function teamSpawnPoint(unit) {
    if (unit === gameState.player || unit.team === 'blue') return { x: unit === gameState.player ? 150 : 220, y: unit === gameState.player ? GAME_HEIGHT / 2 : 230 + (unit.id % 4) * 110 };
    return { x: GAME_WIDTH - 220, y: 190 + (unit.id % 5) * 105 };
}

function markTeamDefeated(unit) {
    if (!unit || unit.respawnTicks > 0) return;
    const respawnSeconds = gameState.teamOvertime ? 5 : 3;
    unit.hp = 0; unit.vx = 0; unit.vy = 0; unit.respawnTicks = respawnSeconds * TARGET_FPS;
    if (unit === gameState.player) gameState.rankItemNotice = `💤 你已被击败：${respawnSeconds} 秒后在我方出生点复活。`;
}

function updateTeamRespawns(frameScale = 1) {
    if (gameState.mode !== 'team') return;
    [gameState.player, ...gameState.allies, ...gameState.enemies].forEach(unit => {
        if (!unit || unit.hp > 0 || !(unit.respawnTicks > 0)) return;
        unit.respawnTicks = Math.max(0, unit.respawnTicks - frameScale);
        if (unit.respawnTicks > 0) return;
        const spawn = teamSpawnPoint(unit);
        unit.x = unit.targetX = spawn.x; unit.y = unit.targetY = spawn.y;
        unit.hp = unit.maxHp;
        unit.invulnerableTicks = 1.5 * TARGET_FPS;
        if (unit === gameState.player) gameState.rankItemNotice = '🛡️ 已复活！1.5 秒无敌时间。';
    });
}

function checkTeamBattles() {
    if (gameState.mode !== 'team') return;
    // 每帧只结算一组 AI 对战；阵亡者保留在队列里，等待出生点复活。
    let battlePair = null;
    for (const ally of gameState.allies) {
        if (ally.hp <= 0) continue;
        const enemy = gameState.enemies.find(foe => foe.hp > 0 && Math.hypot(ally.x - foe.x, ally.y - foe.y) < 55);
        if (enemy) { battlePair = { ally, enemy }; break; }
    }
    if (battlePair) {
        const { ally, enemy } = battlePair;
        const enemyDefeated = attackOnce(ally, enemy);
        if (enemyDefeated) markTeamDefeated(enemy);
        if (enemy.hp > 0 && attackOnce(enemy, ally)) markTeamDefeated(ally);
    }
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
    const objectives = (gameState.teamObjectives || []).filter(objective => objective.visible !== false);
    const objectiveFor = (unit, side) => {
        const available = objectives.filter(objective => objective.owner !== side);
        return closest(unit, available.length ? available : objectives);
    };
    gameState.allies.forEach(ally => {
        if (ally.hp <= 0) return;
        const target = closest(ally, gameState.enemies.filter(enemy => enemy.hp > 0));
        const objective = objectiveFor(ally, 'blue');
        if (target && Math.hypot(ally.x-target.x, ally.y-target.y) < 135) { ally.targetX=target.x; ally.targetY=target.y; }
        else if (objective) { ally.targetX=objective.x; ally.targetY=objective.y; }
    });
    gameState.enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const targets = [...(gameState.player.hp > 0 ? [gameState.player] : []), ...gameState.allies.filter(ally => ally.hp > 0)];
        const target = closest(enemy, targets), objective = objectiveFor(enemy, 'red');
        if (target && Math.hypot(enemy.x-target.x, enemy.y-target.y) < 135) { enemy.targetX=target.x; enemy.targetY=target.y; }
        else if (objective) { enemy.targetX=objective.x; enemy.targetY=objective.y; }
    });
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
        const actualDamage = player.takeDamage(damage, boss);
        boss.bossSkillCooldown = 7 * TARGET_FPS;
        boss.bossRoar = true;
        boss.lastActionText = boss.bossSkillName || '王者猛击';
        boss.attackFlash = 42;
        player.lastCombatTime = gameState.world.time;
        spawnDamageNumber(player, actualDamage, false, 'enemy');
        // 咆哮会在 Boss 脚下释放一圈持续扩散的红色冲击波。
        const roar = new SkillEffect(boss, { name: boss.lastActionText, effect: 'roar' });
        roar.radius = 154;
        roar.life = 58;
        roar.color = '#ff241d';
        gameState.skillEffects.push(roar);
    }
}

function endGame() {
    if (gameState.mode === 'skinTrial') return respawnSkinTrialPlayer();
    exitGameFullscreen();
    if (gameState.mode === 'tower') clearRankedRun('tower');
    if (isRankProgressMode()) {
        finishRankedMatch(false);
        return;
    }
    trackLimitedGiftProgress('matches', 1);
    trackBattlePassMatch(false);
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
    
    const skillsToShow = [...(gameState.pendingLevelUpSkills || [])];
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
    const addSkillChoices = () => {
        // 连击技能会定期出现，但不会每级强制塞入，避免太快叠到上限。
        const comboPool = SKILLS.filter(skill => (skill.type === 'combo' || skill.value?.combo) && !skillsToShow.includes(skill));
        if ((gameState.player.comboChance || 0) < MAX_COMBO_CHANCE && comboPool.length && Math.random() < .24) {
            skillsToShow.push(comboPool[Math.floor(Math.random() * comboPool.length)]);
        }
        while (skillsToShow.length < 3) skillsToShow.push(pickSkill());
    };
    if (skillsToShow.length !== 3) {
        skillsToShow.length = 0;
        addSkillChoices();
    }
    gameState.pendingLevelUpSkills = skillsToShow;
    saveRankedRun();

    const grid = document.getElementById('skillsGrid');
    grid.innerHTML = '';
    document.getElementById('levelUpInfo').textContent = gameState.evolutionMessage || `升级到 Lv.${gameState.player.level}!`;

    const renderSkills = () => {
    grid.innerHTML = '';
    skillsToShow.forEach((skill, index) => {
        const card = document.createElement('div');
        card.className = `skill-card rarity-${skill.rarity}`;
        const givesCrit = skill.type === 'crit' || !!skill.value?.crit;
        const givesCombo = skill.type === 'combo' || !!skill.value?.combo;
        const capWarnings = [];
        if (givesCrit && (gameState.player.critChance || 0) >= 1) capWarnings.push('暴击率已满：暴击部分转为攻击');
        if (givesCombo && (gameState.player.comboChance || 0) >= MAX_COMBO_CHANCE) capWarnings.push('连击率已满：连击部分转为生命上限');
        const warningMarkup = capWarnings.length ? ` <span class="skill-cap-warning">（${capWarnings.join('；')}）</span>` : '';
        card.innerHTML = `
            <div class="skill-name"><span class="rarity-tag">${RARITY_INFO[skill.rarity].label}</span>${skill.name}</div>
            <div class="skill-desc">${skill.desc}${skill.type === 'hp' ? `（当前上限 ${gameState.player.maxHp} → ${gameState.player.maxHp + skill.value}）` : ''}${warningMarkup}</div>
        `;
        card.onclick = () => {
            gameState.pendingLevelUpSkills = [];
            gameState.evolutionMessage = '';
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
    if (['tower','ranked','evolution'].includes(gameState.mode)) {
        const rerolls = gameState.skillRerolls || 0;
        const cost = rerolls === 0 ? 0 : rerolls * 10;
        const button = document.createElement('button'); button.className = 'btn';
        button.textContent = cost ? `🔄 刷新技能（🪙 ${cost}）` : '🔄 免费刷新技能（本局一次）';
        button.onclick = () => {
            if (cost && gameState.stats.coins < cost) return window.alert('金币不足！');
            if (cost) { gameState.stats.coins -= cost; localStorage.setItem('coins', gameState.stats.coins); }
            gameState.skillRerolls = rerolls + 1;
            skillsToShow.length = 0; addSkillChoices();
            gameState.pendingLevelUpSkills = skillsToShow;
            saveRankedRun();
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
document.getElementById('evolutionModeButton').addEventListener('click', () => chooseMode('evolution'));
document.getElementById('teamUpdateConfirmButton').addEventListener('click', () => {
    const skipNextTime = document.getElementById('teamUpdateSkipCheckbox').checked;
    if (skipNextTime) localStorage.setItem('hideTeamModeUpdateNotice', '1');
    else localStorage.removeItem('hideTeamModeUpdateNotice');
    document.getElementById('teamUpdateModal').classList.add('hidden');
    chooseMode('team', true);
});
document.getElementById('resumeSaveButton').addEventListener('click', () => {
    const mode = pendingSaveMode; pendingSaveMode = null;
    document.getElementById('saveChoiceModal').classList.add('hidden');
    if (!resumeRankedRun(mode)) window.alert('存档读取失败，请选择开始新游戏。');
});
document.getElementById('deleteSaveButton').addEventListener('click', () => {
    const mode = pendingSaveMode; pendingSaveMode = null;
    document.getElementById('saveChoiceModal').classList.add('hidden');
    settleAbandonedRun(mode);
});
document.getElementById('saveChoiceBackButton').addEventListener('click', () => {
    pendingSaveMode = null; document.getElementById('saveChoiceModal').classList.add('hidden'); showHall();
});
document.getElementById('fullscreenButton').addEventListener('click', toggleFullscreen);
document.getElementById('hallFullscreenButton').addEventListener('click', toggleFullscreen);
document.getElementById('skinTrialExitButton').addEventListener('click', exitSkinTrialToHall);
document.getElementById('selectBackButton').addEventListener('click', cancelAnimalSelection);
document.getElementById('heroSortLowButton').addEventListener('click', () => setHeroSelectionSort('low'));
document.getElementById('heroSortHighButton').addEventListener('click', () => setHeroSelectionSort('high'));
document.getElementById('signButton').addEventListener('click', claimDailySignIn);
document.getElementById('hundredSignButton').addEventListener('click', claimHundredSignIn);
document.getElementById('desktopModeButton').addEventListener('click', () => setControlMode('desktop'));
document.getElementById('mobileModeButton').addEventListener('click', () => setControlMode('mobile'));
document.getElementById('outsideChestTap').addEventListener('click', tapOutsideChest);
document.getElementById('outsideChestIcon').addEventListener('click', tapOutsideChest);
document.getElementById('outsideChestClaim').addEventListener('click', claimOutsideChest);
window.addEventListener('pagehide', settleOutsideChestOnExit);
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
let skillInfoHoldTimer = null;
function openSkillInfo() {
    skillInfoHoldTimer = null;
    const player = gameState.player;
    if (!player || gameState.screen !== 'playing') return;
    const active = player.activeAbility;
    const passive = player.passiveAbility;
    document.getElementById('skillInfoTitle').textContent = `ⓘ ${player.name} · 技能介绍`;
    document.getElementById('skillInfoContent').innerHTML = `
        <div class="feedback-heading">被动 · ${passive.name}</div>
        <div>${passive.desc}</div>
        <hr style="border:0;border-top:1px solid #c9d5e2;margin:14px 0">
        <div class="feedback-heading">主动 · ${active.name}</div>
        <div>${active.desc}</div>
        <div class="tip" style="margin-top:10px">冷却：${active.cooldown} 秒。${controlMode === 'mobile' ? '点击技能按钮即可释放主动技能。' : '按空格或点击技能按钮即可释放主动技能。'}</div>${gameState.mode === 'tutorial' ? '<div class="feedback-heading" style="margin-top:12px">新手提示</div><div>被动技能不用按，会一直自动生效；主动技能需要你手动释放。关闭本页后，跟着箭头释放一次主动技能继续试炼。</div>' : ''}`;
    gameState.screen = 'skillinfo';
    document.getElementById('skillInfoModal').classList.remove('hidden');
}
function closeSkillInfo() {
    document.getElementById('skillInfoModal').classList.add('hidden');
    if (gameState.screen === 'skillinfo') gameState.screen = 'playing';
}
const skillInfoButton = document.getElementById('skillInfoButton');
skillInfoButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    skillInfoHoldTimer = setTimeout(openSkillInfo, 600);
});
['pointerup', 'pointerleave', 'pointercancel'].forEach(eventName => skillInfoButton.addEventListener(eventName, () => {
    if (skillInfoHoldTimer) clearTimeout(skillInfoHoldTimer);
    skillInfoHoldTimer = null;
}));
skillInfoButton.addEventListener('contextmenu', event => event.preventDefault());
skillInfoButton.addEventListener('click', openSkillInfo);
document.getElementById('skillInfoClose').addEventListener('click', closeSkillInfo);
document.getElementById('provokeButton').addEventListener('click', () => {
    if (!['ranked', 'tower', 'evolution'].includes(gameState.mode) || !gameState.player) return;
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
    if (!document.getElementById('outsideChestModal').classList.contains('hidden') && e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) tapOutsideChest();
        return;
    }
    if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        if (!e.repeat) openSkillInfo();
        return;
    }
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
    const speed = (2.1 + gameState.player.speed * 0.24) * (gameState.player.speedBoostTicks > 0 ? 1.45 : 1);
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
            ctx.fillStyle = number.source === 'heal' ? '#126b3a' : number.combo ? '#9c4dff' : number.critical ? '#e53935' : number.source === 'enemy' ? '#ffcc39' : number.source === 'reflect' ? '#123b8d' : '#111';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            const text = `${number.source === 'heal' ? '+' : '-'}${number.amount}`;
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
    // 局内数据面板固定显示英雄原始图标；皮肤只在3D模型和技能特效上体现。
    document.getElementById('playerAvatar').innerHTML = player.evolved ? player.emoji : heroIconMarkup(player.type, ANIMALS[player.type]);
    document.getElementById('playerName').textContent = player.name;
    const visibleAttack = player.attack + (player.empoweredHits > 0 ? player.empoweredDamage : 0);
    document.getElementById('playerAttack').textContent = visibleAttack;
    document.getElementById('playerDefense').textContent = player.defense;
    document.getElementById('playerSpeed').textContent = `${player.speed}（移动 ${Math.round((2.1 + player.speed * .24) * 10) / 10} / 攻速）`;
    document.getElementById('playerCritChance').textContent = `${Math.round(Math.min(1, player.critChance) * 100)}%`;
    document.getElementById('playerComboChance').textContent = `${Math.round(Math.min(MAX_COMBO_CHANCE, Math.max(0, player.comboChance || 0)) * 100)}%`;
    document.getElementById('playerLevel').textContent = player.level;
    const statusEffects = document.getElementById('statusEffects');
    const secondsLeft = ticks => Math.max(0, Math.ceil(ticks / TARGET_FPS));
    const statuses = [];
    if ((player.magnetTicks || 0) > 0) statuses.push({ icon:'🧲', text:`吸铁石 ${secondsLeft(player.magnetTicks)}秒` });
    if ((player.battleTonicTicks || 0) > 0) statuses.push({ icon:'⚔️', text:`锋芒药剂 ${secondsLeft(player.battleTonicTicks)}秒` });
    if ((player.shieldHits || 0) > 0) statuses.push({ icon:'🛡️', text:`护盾 ${player.shieldHits}次` });
    if ((player.teamRallyTicks || 0) > 0) statuses.push({ icon:'🎏', text:`战旗战意 ${secondsLeft(player.teamRallyTicks)}秒` });
    if (gameState.mode === 'team' && player.teamAngel) statuses.push({ icon:'😇', text:'天使之力' });
    if (gameState.mode === 'team' && player.teamDemon) statuses.push({ icon:'😈', text:'魔王之力' });
    if (gameState.mode === 'team' && gameState.teamOvertime) statuses.push({ icon:'⚔️', text:'加时决战' });
    statusEffects.innerHTML = statuses.map(status => `<span class="status-effect"><span>${status.icon}</span>${status.text}</span>`).join('');
    statusEffects.hidden = !statuses.length;

    // 专属能力
    document.getElementById('passiveSkill').textContent = `被动·${player.passiveAbility.name}：${player.passiveAbility.desc}`;
    const activeButton = document.getElementById('activeSkillButton');
    const cooldownSeconds = Math.ceil(player.activeCooldown / TARGET_FPS);
    const skillIcon = player.activeAbility.effect === 'dash' ? '💨' : player.activeAbility.effect === 'empower' ? '🎯' : player.activeAbility.effect === 'pull' ? '🌀' : player.activeAbility.effect === 'ink' ? '🌊' : player.activeAbility.effect === 'poison' ? '☠️' : player.activeAbility.effect === 'reflect' ? '🦔' : player.activeAbility.effect.includes('heal') ? '💚' : player.activeAbility.effect === 'shield' ? '🛡️' : '✨';
    activeButton.textContent = cooldownSeconds > 0
        ? `${skillIcon} ${player.activeAbility.name} · 冷却 ${cooldownSeconds}s`
        : `${skillIcon} ${player.activeAbility.name}（${controlMode === 'mobile' ? '点击' : '空格'}）`;
    activeButton.title = player.activeAbility.desc;
    activeButton.disabled = player.activeCooldown > 0;
    activeButton.classList.toggle('polar-skill', gameState.environment === 'polar');

    const provokeButton = document.getElementById('provokeButton');
    const canProvoke = ['ranked', 'tower', 'evolution'].includes(gameState.mode) && gameState.screen === 'playing';
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
    document.getElementById('enemyCount').textContent = gameState.enemies.length;
    document.getElementById('worldLevel').textContent = gameState.world.level;
    document.getElementById('modeLabel').textContent = gameState.mode === 'skinTrial' ? '皮肤试玩' : gameState.mode === 'ranked' ? '排位' : gameState.mode === 'evolution' ? `进化试炼 ${gameState.world.level} 层` : `爬塔 ${gameState.world.level} 层`;
    const objectiveText = document.getElementById('teamObjectiveText');
    if (objectiveText) {
        if (gameState.mode !== 'team') objectiveText.textContent = '';
        else {
            const objectives = (gameState.teamObjectives || []).filter(objective => objective.visible !== false);
            const blue = objectives.filter(objective => objective.owner === 'blue').length;
            const red = objectives.filter(objective => objective.owner === 'red').length;
            const contesting = objectives.find(objective => {
                const inRange = unit => unit.hp > 0 && Math.hypot(unit.x - objective.x, unit.y - objective.y) <= objective.radius;
                return ((inRange(gameState.player) ? 1 : 0) + gameState.allies.filter(inRange).length) > 0 && gameState.enemies.filter(inRange).length > 0;
            });
            const valueText = objectives.map(objective => `${objective.mark}${Math.round(Math.abs(objective.progress))}%`).join(' · ');
            const powerText = !gameState.teamPowerAwarded
                ? (gameState.teamOvertime ? ' · B 点出现优势后将重新判定天使/魔王之力' : ` · 天使/魔王之力将在 ${Math.max(0, Math.ceil(60 - gameState.world.time))} 秒后判定`)
                : ` · 😇${gameState.teamAngelTeam === 'blue' ? '我方' : '敌方'}天使 · 😈${gameState.teamDemonTeam === 'blue' ? '我方' : '敌方'}魔王`;
            const scoreText = gameState.teamOvertime ? '加时决战：B 决胜点' : `据点：我方 ${blue}/3 · 敌方 ${red}/3`;
            objectiveText.textContent = `${gameState.rankItemNotice ? `${gameState.rankItemNotice} · ` : ''}${scoreText} · ${valueText}${contesting ? ` · ${contesting.label}争夺暂停` : ''}${powerText}`;
        }
    }
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
        addDailyPlayTime(elapsedSeconds);
        if (gameState.player.hp > 0 && gameState.player.lastCombatTime !== undefined && gameState.world.time - gameState.player.lastCombatTime >= 5) {
            // 每完整一秒才结算一次回血，生命值始终保持整数。
            const player = gameState.player;
            player.regenProgress = (player.regenProgress || 0) + elapsedSeconds;
            const secondsToHeal = Math.floor(player.regenProgress);
            if (secondsToHeal > 0) {
                // 脱战刚开始每秒只回 1 点；每持续 3 秒额外加快 1 点，最多加快到 12 点/秒。
                const outOfCombatSeconds = gameState.world.time - player.lastCombatTime - 5;
                const acceleration = Math.min(11, Math.floor(Math.max(0, outOfCombatSeconds) / 3));
                const healPerSecond = 1 + acceleration + Math.max(0, Math.floor(player.regenBonus || 0));
                const hpBeforeRegen = player.hp;
                player.hp = Math.min(player.maxHp, player.hp + secondsToHeal * healPerSecond);
                spawnHealingNumber(player, player.hp - hpBeforeRegen);
                player.regenProgress -= secondsToHeal;
            }
        } else {
            gameState.player.regenProgress = 0;
        }
        gameState.player.update(frameScale);
        // 宝箱道具：吸铁石只拉取附近经验点；锋芒药剂结束后会准确还原临时攻击。
        if (gameState.player.magnetTicks > 0) {
            gameState.player.magnetTicks = Math.max(0, gameState.player.magnetTicks - frameScale);
            gameState.particles.forEach(particle => {
                if (particle.type === 'exp' && Math.hypot(particle.x - gameState.player.x, particle.y - gameState.player.y) <= 280) particle.autoCollect = true;
            });
        }
        if (gameState.player.battleTonicTicks > 0) {
            gameState.player.battleTonicTicks = Math.max(0, gameState.player.battleTonicTicks - frameScale);
            if (gameState.player.battleTonicTicks === 0) gameState.player.attack = Math.max(1, gameState.player.attack - 8);
        }
        if (gameState.mode === 'tutorial' && gameState.tutorial && gameState.tutorial.step === 0 && Math.hypot(gameState.player.vx, gameState.player.vy) > .05) {
            setTutorialStep(1);
        }
        if (gameState.mode === 'tutorial') refreshTutorialCoachPosition();
        // 试玩的任何击杀路径都由这里兜底检查，训练兔不会因某一条逻辑漏调而停止刷新。
        if (gameState.mode === 'skinTrial' && gameState.enemies.length === 0) queueSkinTrialOpponent();
        updateTeamRespawns(frameScale);
        updateTeamTargets();
        updateTeamObjective(frameScale);
        updateTeamEasterEgg(frameScale);
        gameState.allies.forEach(ally => ally.update(frameScale));
        gameState.enemies.forEach(enemy => enemy.update(frameScale));
        for (const enemy of [...gameState.enemies]) {
            if (!enemy.poisonTicks || enemy.poisonTicks <= 0) continue;
            enemy.poisonTicks = Math.max(0, enemy.poisonTicks - frameScale);
            enemy.poisonProgress = (enemy.poisonProgress || 0) + frameScale;
            if (enemy.poisonProgress >= TARGET_FPS) {
                enemy.poisonProgress -= TARGET_FPS;
                const poisonDamage = enemy.takeDamage(4, enemy.poisonSource || gameState.player);
                spawnDamageNumber(enemy, poisonDamage, false, 'player');
                if (enemy.hp <= 0) defeatEnemyBySkill(enemy);
            }
        }
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
        updateKillEffects(frameScale);
        updateDamageNumbers(frameScale);
        
        checkCollisions();
        checkRankedAIBattles();
        checkTeamBattles();
        if (['ranked', 'tower', 'evolution'].includes(gameState.mode) && gameState.world.time - lastRankedSaveAt >= 1) {
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
    ['hallModal','subPageModal','skinChoiceChestPrompt','skillInfoModal','tutorialModal','selectModal','levelUpModal','gameOverModal','saveChoiceModal','outsideChestModal','playerStats','gameStats'].forEach(id => {
        const element = document.getElementById(id); if (element) container.append(element);
    });
    init();
    init3DRenderer();
    document.getElementById('importSaveFile')?.addEventListener('change', event => {
        importGameSave(event.target.files?.[0]);
        event.target.value = '';
    });
});
setInterval(() => {
    if (gameState.screen === 'hall' && currentBattlePassSeason().id !== BATTLE_PASS_SEASON) window.location.reload();
}, 60000);
window.addEventListener('pagehide', saveRankedRun);
