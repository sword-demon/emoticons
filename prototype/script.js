// AI表情包生成器 JavaScript 交互逻辑

// 预设关键词库
const keywordThemes = {
    daily: [
        '开心大笑', '思考人生', '震惊表情', '委屈巴巴',
        '加油打气', '疑问脸', '无语凝噎', '赞同点头',
        '拒绝摇头', '困倦打瞌睡', '激动兴奋', '淡定从容',
        '害羞脸红', '得意洋洋', '紧张焦虑', '放松休息'
    ],
    work: [
        '加班熬夜', '开会犯困', 'deadline前', '被老板批评',
        '涨薪开心', '辞职潇洒', '摸鱼偷懒', '996福报',
        '同事甩锅', '项目延期', '技术难题', '代码bug',
        '上班路上', '下班解脱', '周一忧郁', '周五狂欢'
    ],
    funny: [
        '哈哈哈笑死', '我裂开了', '绝绝子', 'emo了',
        '社死现场', '尴尬癌犯了', '笑不活了', '整个懵比',
        '我酸了', '柠檬精', '真香警告', '鸽了鸽了',
        '摆烂躺平', '内卷焦虑', '凡尔赛', '网抑云时间'
    ],
    emotion: [
        '开心快乐', '伤心难过', '愤怒生气', '平静淡然',
        '紧张不安', '兴奋激动', '失望沮丧', '感动流泪',
        '惊讶震惊', '恐惧害怕', '厌恶反感', '羞耻害羞',
        '骄傲自豪', '嫉妒羡慕', '同情理解', '爱意满满'
    ]
};

// AI灵感库 - 基础形象描述
const inspirationLibrary = [
    // 可爱动物系列
    '一只戴着小眼镜的橘色柴犬，表情呆萌',
    '穿着小西装的白色猫咪，优雅坐姿',
    '戴着蝴蝶结的粉色小猪，圆滚滚身材',
    '穿着学生装的小熊猫，黑白相间',
    '戴着厨师帽的小狐狸，橙色毛发',

    // 人物角色系列
    '戴着眼镜的程序员，休闲T恤配牛仔裤',
    '穿着职业装的白领女性，简约干练',
    '戴着棒球帽的青春男生，运动风格',
    '穿着连衣裙的温柔女孩，甜美笑容',
    '留着胡子的大叔，穿着格子衬衫',

    // 幻想角色系列
    '绿色皮肤的小外星人，大大的黑眼睛',
    '穿着法袍的小巫师，手持魔法杖',
    '戴着皇冠的小公主，粉色蓬蓬裙',
    '穿着盔甲的小骑士，勇敢表情',
    '彩色头发的小精灵，透明翅膀',

    // 职业角色系列
    '穿着白大褂的医生，听诊器挂脖子',
    '戴着安全帽的工程师，工装制服',
    '穿着围裙的厨师，手持锅铲',
    '戴着警帽的警察，严肃表情',
    '穿着消防服的消防员，头盔反光',

    // 卡通风格系列
    '圆形身体的机器人，蓝色金属外壳',
    '方块头的像素人物，8位游戏风格',
    '水滴形状的史莱姆，果冻质感',
    '三角形的小怪物，一只独眼',
    '星形的魔法生物，闪闪发光'
];

// 随机关键词库 - 4字以内的情感动作词语
const randomKeywords = [
    // 基础情感词汇
    '开心', '难过', '愤怒', '惊讶', '恐惧', '厌恶', '思考', '疑惑',
    '兴奋', '紧张', '放松', '专注', '无聊', '累了', '困倦', '清醒',

    // 积极情感
    '大笑', '微笑', '傻笑', '狂欢', '得意', '自豪', '满足', '幸福',
    '感动', '温暖', '甜蜜', '浪漫', '可爱', '萌萌哒', '棒极了', '赞',

    // 消极情感
    '哭泣', '伤心', '沮丧', '失望', '绝望', '痛苦', '焦虑', '烦躁',
    '无语', '无奈', '崩溃', '抓狂', '郁闷', '心累', '受伤', '委屈',

    // 惊讶震惊
    '震惊', '惊呆', '傻眼', '懵逼', '目瞪', '吃惊', '意外', '不敢信',
    '什么', '天啊', '我去', '卧槽', '牛批', '厉害', '绝了', '服了',

    // 动作表情
    '眨眼', '瞪眼', '翻白眼', '挤眉', '撇嘴', '嘟嘴', '咬牙', '叹气',
    '点头', '摇头', '耸肩', '摊手', '拍手', '比心', '竖拇指', '做鬼脸',

    // 状态描述
    '发呆', '走神', '发愣', '呆滞', '机械', '木讷', '淡定', '冷静',
    '暴躁', '狂野', '疯狂', '癫狂', '嗨翻', '炸裂', '燃烧', '爆发',

    // 网络流行词
    'emo', '躺平', '摆烂', '内卷', '凡尔赛', '绝绝子', '栓Q', '芭比Q',
    '社死', '破防', '暴击', '秒杀', '王炸', '绝杀', '翻车', '真香',

    // 日常状态
    '饿了', '困了', '累了', '疼了', '冷了', '热了', '渴了', '饱了',
    '醒了', '睡了', '起床', '洗漱', '吃饭', '上班', '下班', '回家'
];

// 全局变量
let currentGenerationData = null;
let paymentOrderId = null;

// DOM元素
const elements = {
    // 图片上传相关
    uploadImageBtn: document.getElementById('uploadImageBtn'),
    inspirationBtn: document.getElementById('inspirationBtn'),
    imageInput: document.getElementById('imageInput'),
    imagePreview: document.getElementById('imagePreview'),
    previewImg: document.getElementById('previewImg'),
    recognitionLoading: document.getElementById('recognitionLoading'),

    // 主体描述
    subjectInput: document.getElementById('subjectInput'),
    subjectCharCount: document.getElementById('subjectCharCount'),

    // 关键词
    keywordsContainer: null, // 将在初始化时设置
    quickFillBtns: document.querySelectorAll('.quick-fill-btn'),
    randomFillBtn: document.getElementById('randomFillBtn'),

    // 生成相关
    generateBtn: document.getElementById('generateBtn'),
    generateLoading: document.getElementById('generateLoading'),

    // 预览相关
    previewSection: document.getElementById('previewSection'),
    previewGrid: document.getElementById('previewGrid'),

    // 下载相关
    downloadSection: document.getElementById('downloadSection'),
    freeDownloadBtn: document.getElementById('freeDownloadBtn'),
    paidDownloadBtn: document.getElementById('paidDownloadBtn'),

    // 支付相关
    paymentModal: document.getElementById('paymentModal'),
    cancelPayment: document.getElementById('cancelPayment'),
    checkPayment: document.getElementById('checkPayment'),
    paymentStatus: document.getElementById('paymentStatus')
};

// 初始化函数
function init() {
    createKeywordInputs();
    bindEvents();
    updateCharCount();
}

// 创建16个关键词输入框
function createKeywordInputs() {
    const container = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-4.gap-3.mb-4');
    elements.keywordsContainer = container;

    for (let i = 1; i <= 16; i++) {
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'relative';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `keyword${i}`;
        input.className = 'w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm';
        input.placeholder = `关键词 ${i}`;
        input.maxLength = 10;

        // 添加字符计数 - 放在输入框内部右侧
        const charCount = document.createElement('div');
        charCount.className = 'absolute top-1/2 right-2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none';
        charCount.textContent = '0/10';

        // 绑定输入事件
        input.addEventListener('input', (e) => {
            const count = e.target.value.length;
            charCount.textContent = `${count}/10`;
            validateForm();
        });

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(charCount);
        container.appendChild(inputWrapper);
    }
}

// 绑定事件
function bindEvents() {
    // 图片上传
    elements.uploadImageBtn.addEventListener('click', () => {
        elements.imageInput.click();
    });

    // 灵感按钮
    elements.inspirationBtn.addEventListener('click', generateInspiration);

    elements.imageInput.addEventListener('change', handleImageUpload);

    // 主体描述输入
    elements.subjectInput.addEventListener('input', updateCharCount);
    elements.subjectInput.addEventListener('input', validateForm);

    // 快速填充按钮
    elements.quickFillBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;
            fillKeywords(theme);
        });
    });

    // 随机填充关键词按钮
    elements.randomFillBtn.addEventListener('click', randomFillKeywords);

    // 生成按钮
    elements.generateBtn.addEventListener('click', generateStickers);

    // 下载按钮
    elements.freeDownloadBtn.addEventListener('click', downloadFreeVersion);
    elements.paidDownloadBtn.addEventListener('click', startPaymentProcess);

    // 支付相关
    elements.cancelPayment.addEventListener('click', closePaymentModal);
    elements.checkPayment.addEventListener('click', checkPaymentStatus);

    // 点击模态框外部关闭
    elements.paymentModal.addEventListener('click', (e) => {
        if (e.target === elements.paymentModal) {
            closePaymentModal();
        }
    });
}

// 更新字符计数
function updateCharCount() {
    const count = elements.subjectInput.value.length;
    elements.subjectCharCount.textContent = count;
    validateForm();
}

// 表单验证
function validateForm() {
    const subjectValue = elements.subjectInput.value.trim();
    const keywordInputs = document.querySelectorAll('[id^="keyword"]');
    const filledKeywords = Array.from(keywordInputs).filter(input => input.value.trim()).length;

    const isValid = subjectValue.length > 0 && filledKeywords >= 16;
    elements.generateBtn.disabled = !isValid;
}

// 处理图片上传
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 文件大小检查 (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('文件大小不能超过5MB');
        return;
    }

    // 文件类型检查
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('只支持JPG和PNG格式');
        return;
    }

    // 显示预览图
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.previewImg.src = e.target.result;
        elements.imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    // 开始识别
    showRecognitionLoading(true);

    try {
        // 模拟API调用 - 实际应该调用后端接口
        await simulateImageRecognition(file);
    } catch (error) {
        console.error('图片识别失败:', error);
        alert('图片识别失败，请重试');
    } finally {
        showRecognitionLoading(false);
    }
}

// 显示/隐藏识别加载状态
function showRecognitionLoading(show) {
    elements.recognitionLoading.classList.toggle('hidden', !show);
}

// 生成灵感
function generateInspiration() {
    // 禁用按钮，显示加载状态
    elements.inspirationBtn.disabled = true;
    elements.inspirationBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';

    // 模拟AI思考过程
    setTimeout(() => {
        // 从灵感库中随机选择一个描述
        const randomIndex = Math.floor(Math.random() * inspirationLibrary.length);
        const inspiration = inspirationLibrary[randomIndex];

        // 填充到输入框
        elements.subjectInput.value = inspiration;
        updateCharCount();

        // 添加一个小动画效果
        elements.subjectInput.style.background = '#fef3c7';
        setTimeout(() => {
            elements.subjectInput.style.background = '';
        }, 1000);

        // 恢复按钮状态
        elements.inspirationBtn.disabled = false;
        elements.inspirationBtn.innerHTML = '<i class="fas fa-lightbulb mr-2"></i>需要灵感?';

    }, 1500); // 模拟1.5秒的思考时间
}

// 模拟图片识别API调用
async function simulateImageRecognition(file) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟识别结果
            const mockDescriptions = [
                '一只可爱的橘色小猫咪，坐在窗台上',
                '穿着西装的商务男士，表情严肃',
                '戴着眼镜的年轻女性，正在微笑',
                '毛茸茸的金毛犬，舌头伸出来',
                '卡通风格的熊猫，黑白相间'
            ];

            const randomDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
            elements.subjectInput.value = randomDescription;
            updateCharCount();
            resolve(randomDescription);
        }, 2000);
    });
}

// 填充关键词
function fillKeywords(theme) {
    const keywords = keywordThemes[theme];
    if (!keywords) return;

    const keywordInputs = document.querySelectorAll('[id^="keyword"]');
    keywordInputs.forEach((input, index) => {
        if (keywords[index]) {
            input.value = keywords[index];
            // 触发输入事件更新字符计数
            input.dispatchEvent(new Event('input'));
        }
    });
}

// 随机填充关键词
function randomFillKeywords() {
    // 禁用按钮，显示加载状态
    elements.randomFillBtn.disabled = true;
    elements.randomFillBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>生成中...';

    // 模拟思考过程
    setTimeout(() => {
        const keywordInputs = document.querySelectorAll('[id^="keyword"]');

        // 创建随机关键词的副本，避免重复
        const availableKeywords = [...randomKeywords];

        keywordInputs.forEach((input) => {
            if (availableKeywords.length > 0) {
                // 随机选择一个关键词
                const randomIndex = Math.floor(Math.random() * availableKeywords.length);
                const selectedKeyword = availableKeywords[randomIndex];

                // 从可用列表中移除，避免重复
                availableKeywords.splice(randomIndex, 1);

                // 填充到输入框
                input.value = selectedKeyword;

                // 触发输入事件更新字符计数
                input.dispatchEvent(new Event('input'));

                // 添加一个小动画效果
                input.style.background = '#e0e7ff';
                setTimeout(() => {
                    input.style.background = '';
                }, 600);
            }
        });

        // 恢复按钮状态
        elements.randomFillBtn.disabled = false;
        elements.randomFillBtn.innerHTML = '<i class="fas fa-dice mr-1"></i>随机填充关键词';

    }, 1000); // 模拟1秒的生成时间
}

// 生成表情包
async function generateStickers() {
    if (elements.generateBtn.disabled) return;

    // 收集表单数据
    const subjectDescription = elements.subjectInput.value.trim();
    const keywords = [];

    for (let i = 1; i <= 16; i++) {
        const input = document.getElementById(`keyword${i}`);
        keywords.push(input.value.trim());
    }

    // 显示加载状态
    showGenerateLoading(true);
    elements.generateBtn.disabled = true;

    try {
        // 模拟API调用
        const result = await simulateGenerateAPI(subjectDescription, keywords);
        currentGenerationData = result;

        // 显示预览
        displayPreview(result.images);

        // 显示下载选项
        elements.downloadSection.classList.remove('hidden');

        // 滚动到预览区域
        elements.previewSection.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('生成失败:', error);
        alert('生成失败，请重试');
    } finally {
        showGenerateLoading(false);
        elements.generateBtn.disabled = false;
    }
}

// 显示/隐藏生成加载状态
function showGenerateLoading(show) {
    elements.generateLoading.classList.toggle('hidden', !show);
}

// 模拟生成API调用
async function simulateGenerateAPI(subject, keywords) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟生成结果
            const images = keywords.map((keyword, index) => ({
                id: index + 1,
                keyword: keyword,
                watermarkedUrl: `https://picsum.photos/240/240?random=${index + 1}`,
                originalUrl: `https://picsum.photos/240/240?random=${index + 100}` // 模拟无水印版本
            }));

            resolve({
                subject: subject,
                keywords: keywords,
                images: images,
                generationId: 'gen_' + Date.now()
            });
        }, 3000);
    });
}

// 显示预览
function displayPreview(images) {
    elements.previewGrid.innerHTML = '';

    images.forEach(image => {
        const imageItem = document.createElement('div');
        imageItem.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';

        imageItem.innerHTML = `
            <div class="watermark aspect-square bg-gray-100">
                <img src="${image.watermarkedUrl}" alt="${image.keyword}" class="w-full h-full object-cover">
            </div>
            <div class="p-3">
                <p class="text-sm text-gray-600 text-center truncate">${image.keyword}</p>
            </div>
        `;

        elements.previewGrid.appendChild(imageItem);
    });

    elements.previewSection.classList.remove('hidden');
}

// 免费下载水印版
async function downloadFreeVersion() {
    if (!currentGenerationData) return;

    elements.freeDownloadBtn.disabled = true;
    elements.freeDownloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>打包中...';

    try {
        // 模拟打包过程
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 实际应该调用后端API或在前端使用JSZip打包
        // 这里模拟下载
        const link = document.createElement('a');
        link.href = '#'; // 实际应该是ZIP文件的URL
        link.download = 'emoticons_watermarked.zip';
        link.click();

        alert('水印版表情包已开始下载！');

    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    } finally {
        elements.freeDownloadBtn.disabled = false;
        elements.freeDownloadBtn.innerHTML = '<i class="fas fa-download mr-2"></i>下载水印版ZIP';
    }
}

// 开始支付流程
async function startPaymentProcess() {
    if (!currentGenerationData) return;

    try {
        // 模拟创建支付订单
        const orderData = await simulateCreatePaymentOrder();
        paymentOrderId = orderData.orderId;

        // 显示支付模态框
        showPaymentModal(orderData);

    } catch (error) {
        console.error('创建支付订单失败:', error);
        alert('创建支付订单失败，请重试');
    }
}

// 模拟创建支付订单
async function simulateCreatePaymentOrder() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                orderId: 'order_' + Date.now(),
                amount: 9.9,
                qrCodeUrl: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=QR+Code',
                paymentUrl: '#'
            });
        }, 1000);
    });
}

// 显示支付模态框
function showPaymentModal(orderData) {
    // 更新二维码（实际应该显示真实的支付二维码）
    const qrCodeContainer = elements.paymentModal.querySelector('.w-48.h-48');
    qrCodeContainer.innerHTML = `
        <img src="${orderData.qrCodeUrl}" alt="支付二维码" class="w-full h-full rounded-lg">
    `;

    elements.paymentModal.classList.remove('hidden');

    // 开始轮询支付状态
    startPaymentStatusPolling();
}

// 关闭支付模态框
function closePaymentModal() {
    elements.paymentModal.classList.add('hidden');
    stopPaymentStatusPolling();
}

// 支付状态轮询
let paymentPollingInterval = null;

function startPaymentStatusPolling() {
    if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
    }

    paymentPollingInterval = setInterval(async () => {
        try {
            const status = await checkPaymentStatus();
            updatePaymentStatus(status);

            if (status === 'SUCCESS') {
                handlePaymentSuccess();
            } else if (status === 'FAILED') {
                handlePaymentFailure();
            }
        } catch (error) {
            console.error('检查支付状态失败:', error);
        }
    }, 3000);
}

function stopPaymentStatusPolling() {
    if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
        paymentPollingInterval = null;
    }
}

// 检查支付状态
async function checkPaymentStatus() {
    return new Promise((resolve) => {
        // 模拟支付状态检查
        setTimeout(() => {
            // 30%几率返回成功，模拟支付完成
            const random = Math.random();
            if (random < 0.3) {
                resolve('SUCCESS');
            } else if (random < 0.05) {
                resolve('FAILED');
            } else {
                resolve('PENDING');
            }
        }, 500);
    });
}

// 更新支付状态显示
function updatePaymentStatus(status) {
    const statusText = {
        'PENDING': '等待支付中...',
        'SUCCESS': '支付成功！',
        'FAILED': '支付失败，请重试'
    };

    const statusColor = {
        'PENDING': 'text-gray-500',
        'SUCCESS': 'text-green-600',
        'FAILED': 'text-red-600'
    };

    elements.paymentStatus.textContent = statusText[status] || '检查支付状态中...';
    elements.paymentStatus.className = `mt-4 text-sm ${statusColor[status] || 'text-gray-500'}`;
}

// 处理支付成功
function handlePaymentSuccess() {
    stopPaymentStatusPolling();

    setTimeout(() => {
        closePaymentModal();
        downloadPaidVersion();
    }, 2000);
}

// 处理支付失败
function handlePaymentFailure() {
    stopPaymentStatusPolling();
    alert('支付失败，请重试');
}

// 下载付费版本
async function downloadPaidVersion() {
    if (!currentGenerationData || !paymentOrderId) return;

    try {
        // 显示下载状态
        alert('支付成功！正在为您打包高清无水印文件...');

        // 模拟下载过程
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 实际应该调用后端API验证支付状态并返回无水印版本
        const link = document.createElement('a');
        link.href = '#'; // 实际应该是无水印ZIP文件的URL
        link.download = 'emoticons_premium.zip';
        link.click();

        alert('高清无水印表情包已开始下载！');

    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请联系客服');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);