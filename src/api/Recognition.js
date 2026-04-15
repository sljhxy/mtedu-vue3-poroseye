
export class Recognition {
	constructor() {
		this.recognition = null;
		this.listener = undefined;
		this.isStop = false;
		this.recOpt = { timeOut: 2000 };
		this.handleTime = null;
		this.hTime = undefined;
		this.asrLanguage = "cmn-Hans-CN";
		this.onEnd = undefined;
		this.onStart = undefined;
	}

	setListener(fn) {
		this.listener = fn;
		return this;
	}

	setOnEnd(fn) {
		this.onEnd = fn;
		return this;
	}

	setOpt(opt) {
		this.recOpt = opt;
		if (opt.listener) this.setListener(opt.listener);
		if (opt.onEnd) this.setOnEnd(opt.onEnd);
		if (opt.asrLanguage) this.setLang(opt.asrLanguage);
		if (opt.onStart) this.onStart = opt.onStart;
		return this;
	}

	setLang(lang) {
		this.asrLanguage = lang;
		return this;
	}

	start() {
		this.isStop = false;
		if (
			typeof window === "undefined" ||
			(!window.SpeechRecognition && !window.webkitSpeechRecognition)
		) {
			console.warn("当前浏览器不支持 SpeechRecognition，请使用 Chrome 或 Edge");
			return;
		}

		if (!this.recognition) {
			const recognition = new (window.SpeechRecognition ||
				window.webkitSpeechRecognition)();
			this.recognition = recognition;
		}
		const recognition = this.recognition;

		recognition.interimResults = true;
		recognition.lang = this.asrLanguage;
		recognition.continuous = true;

		this.hTime = new Date();
		this.handleTime = setInterval(() => this.check(this), this.recOpt.timeOut);

		recognition.addEventListener("result", (event) => {
			let transcript = "";
			for (let index = 0; index < event.results.length; index++) {
				const item = event.results[index];
				if (transcript && this.asrLanguage.includes("Han")) transcript += "，";
				transcript += item[0]?.transcript;
			}
			if (!transcript) return;
			this.hTime = new Date();
			this.listener?.(transcript);
		});

		recognition.addEventListener("end", () => {
			if (this.isStop) {
				clearInterval(this.handleTime);
				return;
			}
			setTimeout(() => recognition.start(), 1000);
		});

		recognition.start();
		this.onStart?.();
		return this;
	}

	check(that) {
		if (!that.hTime) return;
		const dt = new Date().getTime() - that.hTime.getTime();
		if (dt > that.recOpt.timeOut) {
			that.stop();
		}
	}

	stop() {
		if (this.isStop) return this;
		this.isStop = true;
		this.recognition?.stop();
		clearInterval(this.handleTime);
		this.onEnd?.();
		return this;
	}
}

export const supportLanguages = {
	"cmn-Hans-CN": "普通话 (中国大陆)",
	"cmn-Hans-HK": "普通话 (香港)",
	"yue-Hant-HK": "粵語 (香港)",
	"en-US": "English(United States)",
	"en-GB": "English(United Kingdom)",
	"en-IN": "English(India)",
	"es-ES": "Español",
	"fr-FR": "Français",
	"de-DE": "Deutsch",
	"it-IT": "Italiano",
	"ja-JP": "日本語",
	"ko-KR": "한국어",
	"ar-SA": "العربية",
	"pt-BR": "Português",
	"ru-RU": "Русский",
	"nl-NL": "Nederlands",
	"tr-TR": "Türkçe",
	"sv-SE": "Svenska",
	"hi-IN": "हिन्दी",
	"el-GR": "Ελληνικά",
	"he-IL": "עברית",
	"id-ID": "Bahasa Indonesia",
	"pl-PL": "Polski",
	"th-TH": "ไทย",
	"cs-CZ": "Čeština",
	"hu-HU": "Magyar",
	"da-DK": "Dansk",
	"fi-FI": "Suomi",
	"no-NO": "Norsk",
	"sk-SK": "Slovenčina",
	"uk-UA": "Українська",
	"vi-VN": "Tiếng Việt",
};

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

//浏览器文字播放
export async function speakText(content, callback) {
	if (!window.speechSynthesis) return;
	if (speechSynthesis.speaking) {
		speechSynthesis.cancel();
		callback(false);
	}

	await sleep(300);

	const msg = new SpeechSynthesisUtterance(content);
	msg.lang = "zh";
	msg.rate = 1;
	msg.addEventListener("end", () => {
		callback(false);
	});
	msg.addEventListener("error", () => {
		callback(false);
	});
	callback(true);
	speechSynthesis.speak(msg);
}
