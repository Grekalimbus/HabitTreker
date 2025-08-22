// Класс для управления привычками
class HabitTracker {
	constructor() {
		this.habits = this.loadHabits();
		this.currentTab = "active";
		this.currentHabit = null;
		this.init();
	}

	// Инициализация приложения
	init() {
		console.log("Инициализация HabitTracker...");

		// Проверяем наличие модальных окон
		const habitModal = document.getElementById("habitModal");
		const habitDetailsModal = document.getElementById("habitDetailsModal");
		console.log("Модальное окно habitModal найдено:", !!habitModal);
		console.log(
			"Модальное окно habitDetailsModal найдено:",
			!!habitDetailsModal
		);

		this.setupEventListeners();
		this.renderHabits();
		this.updateUserStats();
		this.switchTab("active");
		console.log("Инициализация завершена");
	}

	// Настройка обработчиков событий
	setupEventListeners() {
		console.log("Настройка обработчиков событий...");

		// Переключение вкладок
		document.querySelectorAll(".tab-btn").forEach(btn => {
			btn.addEventListener("click", e => {
				this.switchTab(e.target.dataset.tab);
			});
		});

		// Кнопки добавления привычек
		const addHabitBtn = document.getElementById("addHabitBtn");
		const addBacklogBtn = document.getElementById("addBacklogBtn");

		if (addHabitBtn) {
			console.log("Кнопка addHabitBtn найдена, добавляем обработчик");
			addHabitBtn.addEventListener("click", () => {
				console.log("Клик по кнопке добавления активной привычки");
				this.openModal("active");
			});
		} else {
			console.error("Кнопка addHabitBtn не найдена!");
		}

		if (addBacklogBtn) {
			console.log("Кнопка addBacklogBtn найдена, добавляем обработчик");
			addBacklogBtn.addEventListener("click", () => {
				console.log("Клик по кнопке добавления в беклог");
				this.openModal("backlog");
			});
		} else {
			console.error("Кнопка addBacklogBtn не найдена!");
		}

		// Модальные окна
		document.getElementById("closeModal").addEventListener("click", () => {
			this.closeModal("habitModal");
		});

		document
			.getElementById("closeDetailsModal")
			.addEventListener("click", () => {
				this.closeModal("habitDetailsModal");
			});

		document.getElementById("cancelBtn").addEventListener("click", () => {
			this.closeModal("habitModal");
		});

		// Форма добавления привычки
		document.getElementById("habitForm").addEventListener("submit", e => {
			e.preventDefault();
			this.addHabit();
		});

		// Закрытие модальных окон по клику вне их
		window.addEventListener("click", e => {
			if (e.target.classList.contains("modal")) {
				this.closeModal("habitModal");
				this.closeModal("habitDetailsModal");
			}
		});
	}

	// Переключение между вкладками
	switchTab(tabName) {
		this.currentTab = tabName;

		// Обновляем активную кнопку
		document.querySelectorAll(".tab-btn").forEach(btn => {
			btn.classList.remove("active");
		});
		document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

		// Показываем соответствующий контент
		document.querySelectorAll(".tab-content").forEach(content => {
			content.classList.remove("active");
		});
		document.getElementById(`${tabName}Tab`).classList.add("active");

		if (tabName === "statistics") {
			this.renderMonthlyCalendar();
			this.updateOverallStats();
		} else {
			this.renderHabits();
		}
	}

	// Открытие модального окна
	openModal(modalType, habit = null) {
		console.log("openModal вызван с параметрами:", modalType, habit);

		if (modalType === "active" || modalType === "backlog") {
			console.log("Открываем модальное окно добавления привычки");
			const modal = document.getElementById("habitModal");
			if (!modal) {
				console.error("Модальное окно habitModal не найдено!");
				return;
			}

			console.log("Модальное окно найдено, добавляем класс active");
			modal.classList.add("active");
			console.log(
				"Классы модального окна после добавления active:",
				modal.className
			);
			console.log(
				"Стили модального окна display:",
				window.getComputedStyle(modal).display
			);
			console.log(
				"Стили модального окна opacity:",
				window.getComputedStyle(modal).opacity
			);
			console.log(
				"Стили модального окна visibility:",
				window.getComputedStyle(modal).visibility
			);
			console.log(
				"Стили модального окна z-index:",
				window.getComputedStyle(modal).zIndex
			);

			// Принудительно устанавливаем стили
			modal.style.display = "flex";
			modal.style.opacity = "1";
			modal.style.visibility = "visible";
			modal.style.zIndex = "1000";

			console.log("Стили принудительно установлены");

			document.getElementById("modalTitle").textContent = habit
				? "Редактировать привычку"
				: "Добавить привычку";

			if (habit) {
				document.getElementById("habitName").value = habit.name;
				document.getElementById("habitDescription").value =
					habit.description || "";
			} else {
				document.getElementById("habitForm").reset();
			}
		} else if (modalType === "habitDetailsModal") {
			this.currentHabit = habit;
			this.showHabitDetails(habit);
			document.getElementById("habitDetailsModal").classList.add("active");
		}
	}

	// Закрытие модального окна
	closeModal(modalId) {
		const modal = document.getElementById(modalId);
		if (modal) {
			modal.classList.remove("active");
			// Принудительно скрываем модальное окно
			modal.style.display = "none";
			modal.style.opacity = "0";
			modal.style.visibility = "hidden";
		}

		if (modalId === "habitModal") {
			document.getElementById("habitForm").reset();
		}
	}

	// Добавление новой привычки
	addHabit() {
		const name = document.getElementById("habitName").value.trim();
		const description = document
			.getElementById("habitDescription")
			.value.trim();

		if (!name) return;

		const habit = {
			id: Date.now().toString(),
			name: name,
			description: description,
			createdAt: new Date().toISOString(),
			isActive: this.currentTab === "active",
			completedDays: {},
			currentStreak: 0,
			maxStreak: 0,
			totalDays: 0,
		};

		if (this.currentTab === "active") {
			this.habits.active.push(habit);
		} else {
			this.habits.backlog.push(habit);
		}

		this.saveHabits();
		this.renderHabits();
		this.updateUserStats();
		this.closeModal("habitModal");
	}

	// Показать детали привычки
	showHabitDetails(habit) {
		document.getElementById("habitDetailsName").textContent = habit.name;
		document.getElementById("habitDetailsDescription").textContent =
			habit.description || "Описание отсутствует";

		document.getElementById("currentStreak").textContent = habit.currentStreak;
		document.getElementById("maxStreak").textContent = habit.maxStreak;
		document.getElementById("totalDays").textContent = habit.totalDays;

		this.renderCalendar(habit);
		this.setupHabitActions(habit);
	}

	// Настройка действий с привычкой
	setupHabitActions(habit) {
		// Перемещение в беклог
		document.getElementById("moveToBacklogBtn").onclick = () => {
			this.moveHabitToBacklog(habit);
		};

		// Удаление привычки
		document.getElementById("deleteHabitBtn").onclick = () => {
			if (confirm("Вы уверены, что хотите удалить эту привычку?")) {
				this.deleteHabit(habit);
			}
		};
	}

	// Перемещение привычки в беклог
	moveHabitToBacklog(habit) {
		const activeIndex = this.habits.active.findIndex(h => h.id === habit.id);
		if (activeIndex !== -1) {
			habit.isActive = false;
			this.habits.active.splice(activeIndex, 1);
			this.habits.backlog.push(habit);
			this.saveHabits();
			this.renderHabits();
			this.updateUserStats();
			this.closeModal("habitDetailsModal");
		}
	}

	// Удаление привычки
	deleteHabit(habit) {
		if (habit.isActive) {
			const index = this.habits.active.findIndex(h => h.id === habit.id);
			if (index !== -1) this.habits.active.splice(index, 1);
		} else {
			const index = this.habits.backlog.findIndex(h => h.id === habit.id);
			if (index !== -1) this.habits.backlog.splice(index, 1);
		}

		this.saveHabits();
		this.renderHabits();
		this.updateUserStats();
		this.closeModal("habitDetailsModal");
	}

	// Активация привычки из беклога
	activateHabit(habit) {
		const backlogIndex = this.habits.backlog.findIndex(h => h.id === habit.id);
		if (backlogIndex !== -1) {
			habit.isActive = true;
			this.habits.backlog.splice(backlogIndex, 1);
			this.habits.active.push(habit);
			this.saveHabits();
			this.renderHabits();
			this.updateUserStats();
		}
	}

	// Отметка дня в календаре
	toggleDay(habit, date) {
		const dateStr = date.toISOString().split("T")[0];

		if (!habit.completedDays[dateStr]) {
			// Отмечаем как выполненную
			habit.completedDays[dateStr] = "completed";
			this.addExperience(10);
		} else if (habit.completedDays[dateStr] === "completed") {
			// Отмечаем как невыполненную
			habit.completedDays[dateStr] = "failed";
			this.addExperience(-12);
		} else {
			// Убираем отметку
			delete habit.completedDays[dateStr];
		}

		this.updateHabitStats(habit);
		this.saveHabits();
		this.updateUserStats();
		this.renderCalendar(habit);
	}

	// Обновление статистики привычки
	updateHabitStats(habit) {
		const dates = Object.keys(habit.completedDays);
		let currentStreak = 0;
		let maxStreak = 0;
		let tempStreak = 0;

		// Сортируем даты
		dates.sort().reverse();

		for (let i = 0; i < dates.length; i++) {
			if (habit.completedDays[dates[i]] === "completed") {
				tempStreak++;
				if (i === 0) currentStreak = tempStreak;
				maxStreak = Math.max(maxStreak, tempStreak);
			} else {
				tempStreak = 0;
			}
		}

		habit.currentStreak = currentStreak;
		habit.maxStreak = maxStreak;
		habit.totalDays = dates.length;
	}

	// Добавление опыта
	addExperience(points) {
		const currentExp = parseInt(localStorage.getItem("totalExperience") || "0");
		const newExp = Math.max(0, currentExp + points);
		localStorage.setItem("totalExperience", newExp.toString());
	}

	// Рендеринг календаря
	renderCalendar(habit) {
		const calendar = document.getElementById("habitCalendar");
		const currentDate = new Date();
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const firstDayOfMonth = new Date(year, month, 1).getDay();

		let calendarHTML = `
            <div class="calendar-header">
                <span>Пн</span>
                <span>Вт</span>
                <span>Ср</span>
                <span>Чт</span>
                <span>Пт</span>
                <span>Сб</span>
                <span>Вс</span>
            </div>
        `;

		// Добавляем пустые ячейки для начала месяца
		for (
			let i = 0;
			i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
			i++
		) {
			calendarHTML += '<div class="calendar-day empty"></div>';
		}

		// Добавляем дни месяца
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			const dateStr = date.toISOString().split("T")[0];
			const isToday = date.toDateString() === currentDate.toDateString();
			const status = habit.completedDays[dateStr] || "";

			let classes = "calendar-day";
			if (status) classes += ` ${status}`;
			if (isToday) classes += " today";

			calendarHTML += `
                <div class="calendar-day ${classes}" 
                     onclick="habitTracker.toggleDay(habitTracker.currentHabit, new Date(${year}, ${month}, ${day}))">
                    ${day}
                    ${
											status === "completed"
												? '<div class="day-stats"><span class="completed-count">+10</span></div>'
												: ""
										}
                    ${
											status === "failed"
												? '<div class="day-stats"><span class="failed-count">-12</span></div>'
												: ""
										}
                </div>
            `;
		}

		calendar.innerHTML = calendarHTML;
	}

	// Рендеринг списка привычек
	renderHabits() {
		const activeList = document.getElementById("activeHabitsList");
		const backlogList = document.getElementById("backlogHabitsList");

		// Рендерим активные привычки
		activeList.innerHTML =
			this.habits.active.length === 0
				? '<p class="empty-state">У вас пока нет активных привычек. Добавьте первую!</p>'
				: this.habits.active
						.map(habit => this.renderHabitItem(habit, true))
						.join("");

		// Рендерим привычки из беклога
		backlogList.innerHTML =
			this.habits.backlog.length === 0
				? '<p class="empty-state">Беклог пуст. Добавьте привычки для будущего!</p>'
				: this.habits.backlog
						.map(habit => this.renderHabitItem(habit, false))
						.join("");

		// Добавляем обработчики для новых элементов
		this.addHabitItemListeners();
	}

	// Рендеринг элемента привычки
	renderHabitItem(habit, isActive) {
		return `
            <div class="habit-item" data-habit-id="${habit.id}">
                <div class="habit-header">
                    <div class="habit-name">
                        <i class="fas fa-leaf"></i>
                        ${habit.name}
                    </div>
                    ${
											!isActive
												? '<button class="btn-primary activate-btn"><i class="fas fa-play"></i> Активировать</button>'
												: ""
										}
                </div>
                ${
									habit.description
										? `<div class="habit-description">${habit.description}</div>`
										: ""
								}
                <div class="habit-stats">
                    <div class="stat">
                        <span class="stat-value">${habit.currentStreak}</span>
                        <span class="stat-label">Текущий стрик</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${habit.maxStreak}</span>
                        <span class="stat-label">Максимальный стрик</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${habit.totalDays}</span>
                        <span class="stat-label">Всего дней</span>
                    </div>
                </div>
                ${
									isActive
										? '<div class="habit-actions"><button class="btn-secondary details-btn"><i class="fas fa-info-circle"></i> Детали</button></div>'
										: ""
								}
            </div>
        `;
	}

	// Добавление обработчиков для элементов привычек
	addHabitItemListeners() {
		// Обработчики для активных привычек
		document.querySelectorAll("#activeHabitsList .habit-item").forEach(item => {
			const detailsBtn = item.querySelector(".details-btn");
			if (detailsBtn) {
				detailsBtn.addEventListener("click", e => {
					e.stopPropagation();
					const habitId = item.dataset.habitId;
					const habit = this.habits.active.find(h => h.id === habitId);
					if (habit) this.openModal("habitDetailsModal", habit);
				});
			}
		});

		// Обработчики для привычек из беклога
		document
			.querySelectorAll("#backlogHabitsList .habit-item")
			.forEach(item => {
				const activateBtn = item.querySelector(".activate-btn");
				if (activateBtn) {
					activateBtn.addEventListener("click", e => {
						e.stopPropagation();
						const habitId = item.dataset.habitId;
						const habit = this.habits.backlog.find(h => h.id === habitId);
						if (habit) this.activateHabit(habit);
					});
				}
			});
	}

	// Обновление статистики пользователя
	updateUserStats() {
		const totalExp = parseInt(localStorage.getItem("totalExperience") || "0");
		document.getElementById("totalExperience").textContent = `${totalExp} XP`;

		// Обновляем прогресс-бар опыта
		const experienceFill = document.getElementById("experienceFill");
		if (experienceFill) {
			let maxExp = 1000; // Максимальный опыт для текущего уровня
			let currentLevelExp = totalExp;

			// Определяем текущий уровень и опыт для него
			if (totalExp >= 1000) {
				maxExp = 2000;
				currentLevelExp = totalExp - 1000;
			} else if (totalExp >= 500) {
				maxExp = 1000;
				currentLevelExp = totalExp - 500;
			} else if (totalExp >= 100) {
				maxExp = 500;
				currentLevelExp = totalExp - 100;
			} else {
				maxExp = 100;
				currentLevelExp = totalExp;
			}

			const percentage = Math.min(
				(currentLevelExp / (maxExp - (maxExp === 100 ? 0 : maxExp - 100))) *
					100,
				100
			);
			experienceFill.style.width = `${percentage}%`;
		}

		// Определяем уровень
		let level = "Новичок";
		if (totalExp >= 1000) level = "Мастер";
		else if (totalExp >= 500) level = "Продвинутый";
		else if (totalExp >= 100) level = "Ученик";

		document.getElementById(
			"levelBadge"
		).innerHTML = `<i class="fas fa-medal"></i><span>${level}</span>`;
	}

	// Рендеринг месячного календаря
	renderMonthlyCalendar() {
		const calendar = document.getElementById("monthlyCalendar");
		if (!calendar) return;

		const currentDate = new Date();
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const firstDayOfMonth = new Date(year, month, 1).getDay();

		let calendarHTML = `
			<div class="calendar-header">
				<span>Пн</span>
				<span>Вт</span>
				<span>Ср</span>
				<span>Чт</span>
				<span>Пт</span>
				<span>Сб</span>
				<span>Вс</span>
			</div>
		`;

		// Добавляем пустые ячейки для начала месяца
		for (
			let i = 0;
			i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
			i++
		) {
			calendarHTML += '<div class="calendar-day empty"></div>';
		}

		// Добавляем дни месяца
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			const dateStr = date.toISOString().split("T")[0];
			const isToday = date.toDateString() === currentDate.toDateString();
			const dayStats = this.getDayStats(dateStr);

			let classes = "calendar-day";
			if (dayStats.completed > 0 && dayStats.failed === 0)
				classes += " completed";
			else if (dayStats.failed > 0) classes += " failed";
			if (isToday) classes += " today";

			calendarHTML += `
				<div class="calendar-day ${classes}" 
					 data-date="${dateStr}"
					 title="${this.getDayTooltip(dateStr, dayStats)}">
					${day}
					${
						dayStats.completed > 0
							? `<div class="day-stats"><span class="completed-count">+${dayStats.completed}</span></div>`
							: ""
					}
					${
						dayStats.failed > 0
							? `<div class="day-stats"><span class="failed-count">-${dayStats.failed}</span></div>`
							: ""
					}
				</div>
			`;
		}

		calendar.innerHTML = calendarHTML;
		this.updateMonthlyStats();
	}

	// Получение статистики за день
	getDayStats(dateStr) {
		let completed = 0;
		let failed = 0;

		[...this.habits.active, ...this.habits.backlog].forEach(habit => {
			if (habit.completedDays[dateStr]) {
				if (habit.completedDays[dateStr] === "completed") {
					completed++;
				} else if (habit.completedDays[dateStr] === "failed") {
					failed++;
				}
			}
		});

		return { completed, failed };
	}

	// Получение подсказки для дня
	getDayTooltip(dateStr, dayStats) {
		if (dayStats.completed === 0 && dayStats.failed === 0) {
			return `День ${dateStr}\nНет отметок`;
		}

		let tooltip = `День ${dateStr}\n`;
		if (dayStats.completed > 0) {
			tooltip += `Выполнено: ${dayStats.completed} (+${
				dayStats.completed * 10
			} XP)\n`;
		}
		if (dayStats.failed > 0) {
			tooltip += `Провалено: ${dayStats.failed} (-${dayStats.failed * 12} XP)`;
		}

		return tooltip;
	}

	// Обновление месячной статистики
	updateMonthlyStats() {
		const currentDate = new Date();
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		let totalCompleted = 0;
		let totalFailed = 0;
		let totalExperience = 0;

		// Проходим по всем дням месяца
		for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
			const date = new Date(year, month, day);
			const dateStr = date.toISOString().split("T")[0];
			const dayStats = this.getDayStats(dateStr);

			totalCompleted += dayStats.completed;
			totalFailed += dayStats.failed;
			totalExperience += dayStats.completed * 10 - dayStats.failed * 12;
		}

		// Обновляем элементы на странице
		document.getElementById("monthlyCompleted").textContent = totalCompleted;
		document.getElementById("monthlyFailed").textContent = totalFailed;
		document.getElementById("monthlyExperience").textContent = totalExperience;

		const totalDays = totalCompleted + totalFailed;
		const successRate =
			totalDays > 0 ? Math.round((totalCompleted / totalDays) * 100) : 0;
		document.getElementById(
			"monthlySuccessRate"
		).textContent = `${successRate}%`;
	}

	// Обновление общей статистики
	updateOverallStats() {
		let overallCurrentStreak = 0;
		let overallMaxStreak = 0;
		let overallTotalDays = 0;
		let totalCompleted = 0;
		let totalFailed = 0;

		// Собираем статистику по всем привычкам
		[...this.habits.active, ...this.habits.backlog].forEach(habit => {
			overallCurrentStreak = Math.max(
				overallCurrentStreak,
				habit.currentStreak
			);
			overallMaxStreak = Math.max(overallMaxStreak, habit.maxStreak);
			overallTotalDays += habit.totalDays;

			Object.values(habit.completedDays).forEach(status => {
				if (status === "completed") totalCompleted++;
				else if (status === "failed") totalFailed++;
			});
		});

		// Обновляем элементы на странице
		document.getElementById("overallCurrentStreak").textContent =
			overallCurrentStreak;
		document.getElementById("overallMaxStreak").textContent = overallMaxStreak;
		document.getElementById("overallTotalDays").textContent = overallTotalDays;

		const totalDays = totalCompleted + totalFailed;
		const overallSuccessRate =
			totalDays > 0 ? Math.round((totalCompleted / totalDays) * 100) : 0;
		document.getElementById(
			"overallSuccessRate"
		).textContent = `${overallSuccessRate}%`;
	}

	// Загрузка привычек из localStorage
	loadHabits() {
		const saved = localStorage.getItem("habits");
		if (saved) {
			return JSON.parse(saved);
		}
		return {
			active: [],
			backlog: [],
		};
	}

	// Сохранение привычек в localStorage
	saveHabits() {
		localStorage.setItem("habits", JSON.stringify(this.habits));
	}
}

// Добавляем стили для пустого состояния и исправляем модальные окна
const style = document.createElement("style");
style.textContent = `
    .empty-state {
        text-align: center;
        color: #888;
        font-style: italic;
        padding: 40px 20px;
        font-size: 1.1rem;
    }
    
    .activate-btn {
        font-size: 0.8rem;
        padding: 6px 12px;
    }
    
    .details-btn {
        font-size: 0.8rem;
        padding: 6px 12px;
    }
    
    /* Принудительное исправление для модальных окон */
    .modal.active {
        display: flex !important;
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 1000 !important;
    }
    
    /* Дополнительные стили для модального окна */
    .modal {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: rgba(0, 0, 0, 0.8) !important;
        z-index: 1000 !important;
    }
    
    .modal-content {
        background-color: #2a2a2a !important;
        border-radius: 12px !important;
        padding: 30px !important;
        max-width: 500px !important;
        width: 90% !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
        position: relative !important;
        z-index: 1001 !important;
    }
`;
document.head.appendChild(style);

// Инициализация приложения
let habitTracker;
document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM загружен, создаем HabitTracker...");
	habitTracker = new HabitTracker();
	console.log("HabitTracker создан:", habitTracker);
});
