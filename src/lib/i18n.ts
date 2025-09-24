export type Locale = 'en' | 'uk' | 'ru';
export const dict: Record<Locale, Record<string,string>> = {
en: { title:'iota online', create:'Create room', join:'Join', name:'Your name', room:'Room ID', play:'Play', logout:'Log out' },
uk: { title:'iota онлайн', create:'Створити кімнату', join:'Приєднатися', name:'Ім’я', room:'Код кімнати', play:'Грати', logout:'Вийти' },
ru: { title:'iota онлайн', create:'Создать комнату', join:'Войти', name:'Имя', room:'Код комнаты', play:'Играть', logout:'Выйти' },
};
export const t = (l:Locale,k:string)=>dict[l][k]||k;