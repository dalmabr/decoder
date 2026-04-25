(function () {
    'use strict';

    const HEADER_HTML = `
<nav class="bg-white/90 backdrop-blur-md fixed w-full top-0 z-[100] shadow-sm border-b border-slate-100">
    <div class="max-w-7xl mx-auto px-6 py-3">
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <img src="https://kimi-web-img.moonshot.cn/img/cbx-prod.b-cdn.net/35221435e704d015190eebf52136ba763b3d7e84.jpg" alt="Logo" class="h-10 w-auto object-contain">
                <div class="font-Sohne text-2xl font-bold text-marrom">SAT-SIA</div>
            </div>

            <div class="flex items-center space-x-2" id="main-nav">
                <a href="index.html" data-nav-link="inicio" class="px-3 py-2 text-sm font-medium text-marrom hover:text-terra hover:bg-slate-50 rounded-lg transition-colors">Início</a>

                <div class="relative" id="dd-programas" data-perm="view_programas">
                    <button type="button" data-dd-toggle class="flex items-center gap-1 px-3 py-2 text-sm font-medium text-marrom hover:text-terra hover:bg-slate-50 rounded-lg transition-colors" aria-expanded="false">
                        Programas
                        <svg class="w-4 h-4 text-marrom/60 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div data-dd-menu class="absolute top-full left-0 pt-2 w-56 z-50 hidden">
                        <div class="bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden">
                            <a href="index.html?view=fluxo" data-view="fluxo" data-perm="view_programas" class="block px-4 py-2.5 text-sm text-marrom hover:text-terra hover:bg-[#FDFBF7] transition-colors">Fluxo de Autorização</a>
                            <a href="index.html?view=copybook" data-view="copybook" data-perm="view_programas" class="block px-4 py-2.5 text-sm text-marrom hover:text-terra hover:bg-[#FDFBF7] transition-colors">Copybook</a>
                            <a href="index.html?view=busca" data-view="busca" data-perm="view_programas" class="block px-4 py-2.5 text-sm text-marrom hover:text-terra hover:bg-[#FDFBF7] transition-colors">Busca por variáveis</a>
                        </div>
                    </div>
                </div>

                <div class="relative" id="dd-tabelas" data-perm="view_tabelas">
                    <button type="button" data-dd-toggle class="flex items-center gap-1 px-3 py-2 text-sm font-medium text-marrom hover:text-terra hover:bg-slate-50 rounded-lg transition-colors" aria-expanded="false">
                        Tabelas
                        <svg class="w-4 h-4 text-marrom/60 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div data-dd-menu class="absolute top-full left-0 pt-2 w-56 z-50 hidden">
                        <div class="bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden">
                            <a href="index.html?view=tabelas" data-view="tabelas" data-perm="view_tabelas" class="block px-4 py-2.5 text-sm text-marrom hover:text-terra hover:bg-[#FDFBF7] transition-colors">Relação de Tabelas</a>
                            <a href="index.html?view=colunas" data-view="colunas" data-perm="view_tabelas" class="block px-4 py-2.5 text-sm text-marrom hover:text-terra hover:bg-[#FDFBF7] transition-colors">Busca por colunas</a>
                        </div>
                    </div>
                </div>

                <div class="relative" id="dd-decode" data-perm="view_decoders">
                    <button type="button" data-dd-toggle data-nav-link="decodificadores" class="flex items-center gap-1 px-3 py-2 text-sm font-medium text-marrom hover:text-terra hover:bg-slate-50 rounded-lg transition-colors" aria-expanded="false">
                        Decodificadores
                        <svg class="w-4 h-4 text-marrom/60 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div data-dd-menu class="absolute top-full right-0 left-auto pt-2 w-56 z-50 hidden">
                        <div class="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-2">
                            <a href="decodificadores.html?tab=iso" class="block px-4 py-2.5 text-sm text-marrom hover:text-terra hover:bg-[#FDFBF7] transition-colors">ISO 8583</a>
                            <a href="decodificadores.html?tab=antifraude" class="block px-4 py-2.5 text-sm text-marrom hover:text-terra hover:bg-[#FDFBF7] transition-colors">Antifraude</a>
                        </div>
                    </div>
                </div>

                <div class="relative" id="dd-decode" data-perm="view_decoders">
                    <a href="index.html?view=all" data-view="all" data-perm="view_all" class="px-3 py-2 text-sm font-medium text-marrom hover:text-terra hover:bg-slate-50 rounded-lg transition-colors pr-0 pl-1">Todos os Adrianos</a>
                </div>

                <div class="w-px h-6 bg-slate-200 mx-1"></div>
                <a href="index.html?view=all" data-view="all" data-perm="view_all" class="px-3 py-2 text-sm font-medium text-marrom hover:text-terra hover:bg-slate-50 rounded-lg transition-colors pr-0 pl-1">Todos os Registros</a>
            </div>

            <div class="flex items-center gap-3">
                <div class="relative block">
                    <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-terra transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="search" id="buscaInput" placeholder="Buscar..." aria-label="Campo de busca" class="w-40 lg:w-48 pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-terra/20 focus:border-terra transition-all outline-none text-marrom">
                </div>
            </div>
        </div>
    </div>
</nav>`;

    let bound = false;

    function closeAllDropdowns() {
        document.querySelectorAll('#site-header [data-dd-menu]').forEach((menu) => {
            menu.classList.add('hidden');
        });
        document.querySelectorAll('#site-header [data-dd-toggle]').forEach((btn) => {
            btn.setAttribute('aria-expanded', 'false');
            btn.querySelector('svg')?.classList.remove('rotate-180');
        });
    }

    function openDropdown(wrapper) {
        const menu = wrapper?.querySelector('[data-dd-menu]');
        const btn = wrapper?.querySelector('[data-dd-toggle]');
        if (!menu || !btn) return;
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        btn.querySelector('svg')?.classList.add('rotate-180');
    }

    function toggleDropdown(wrapper) {
        const menu = wrapper?.querySelector('[data-dd-menu]');
        if (!menu) return;
        const willOpen = menu.classList.contains('hidden');
        closeAllDropdowns();
        if (willOpen) openDropdown(wrapper);
    }

    function getUserPermissions() {
        if (Array.isArray(window.USER_PERMISSIONS)) return window.USER_PERMISSIONS;
        try {
            const raw = localStorage.getItem('sat_user_permissions');
            const parsed = raw ? JSON.parse(raw) : null;
            return Array.isArray(parsed) ? parsed : [];
        } catch (_err) {
            return [];
        }
    }

    function canSee(requiredPerm, grantedPerms) {
        if (!requiredPerm) return true;
        if (!Array.isArray(grantedPerms) || grantedPerms.length === 0) return true;
        if (grantedPerms.includes('*')) return true;
        return grantedPerms.includes(requiredPerm);
    }

    function applyPermissions() {
        const granted = getUserPermissions();
        document.querySelectorAll('#site-header [data-perm]').forEach((el) => {
            const required = el.getAttribute('data-perm');
            el.style.display = canSee(required, granted) ? '' : 'none';
        });
    }

    function markActive() {
        const page = document.body.dataset.page || '';
        const inicio = document.querySelector('#site-header [data-nav-link="inicio"]');
        const decoder = document.querySelector('#site-header [data-nav-link="decodificadores"]');
        if (page === 'index' && inicio) inicio.classList.add('bg-slate-100');
        if (page === 'decodificadores' && decoder) decoder.classList.add('bg-slate-100');
    }

    function bindEvents() {
        if (bound) return;
        bound = true;

        document.addEventListener('click', (event) => {
            const toggleBtn = event.target.closest('#site-header [data-dd-toggle]');
            if (toggleBtn) {
                event.preventDefault();
                event.stopPropagation();
                toggleDropdown(toggleBtn.closest('.relative'));
                return;
            }

            if (!event.target.closest('#site-header')) {
                closeAllDropdowns();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeAllDropdowns();
        });
    }

    function loadHeader() {
        const mount = document.getElementById('site-header');
        if (!mount) return;
        mount.innerHTML = HEADER_HTML;
        applyPermissions();
        markActive();
        closeAllDropdowns();
        bindEvents();
    }

    window.closeAllDropdowns = closeAllDropdowns;
    window.loadSharedHeader = loadHeader;

    document.addEventListener('DOMContentLoaded', loadHeader);
})();
