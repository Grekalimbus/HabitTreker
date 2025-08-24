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
		this.checkDailyPenalties(); // Проверяем штрафы за невыполненные привычки
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

		// Кнопка добавления привычек (теперь одна для всех вкладок)
		const addHabitBtn = document.getElementById("addHabitBtn");

		if (addHabitBtn) {
			console.log("Кнопка addHabitBtn найдена, добавляем обработчик");
			addHabitBtn.addEventListener("click", () => {
				console.log("Клик по кнопке добавления привычки");
				this.openModal(this.currentTab);
			});
		} else {
			console.error("Кнопка addHabitBtn не найдена!");
		}

		// Фильтры календаря
		document.querySelectorAll(".filter-btn").forEach(btn => {
			btn.addEventListener("click", e => {
				// Убираем активный класс у всех кнопок
				document
					.querySelectorAll(".filter-btn")
					.forEach(b => b.classList.remove("active"));
				// Добавляем активный класс к нажатой кнопке
				e.target.classList.add("active");

				const filter = e.target.dataset.filter;
				this.applyCalendarFilter(filter);
			});
		});

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
			this.renderMainStatisticsCalendar();
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

		this.renderHabitDetailsCalendar(habit);
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

	// Отметка привычки на сегодня
	toggleTodayHabit(habit, isCompleted) {
		const today = new Date().toISOString().split("T")[0];

		if (isCompleted) {
			// Отмечаем как выполненную
			habit.completedDays[today] = "completed";
			this.addExperience(10);
		} else {
			// Убираем отметку
			delete habit.completedDays[today];
		}

		this.updateHabitStats(habit);
		this.saveHabits();
		this.updateUserStats();
		this.renderHabits(); // Обновляем список привычек для обновления чекбокса
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
		this.renderHabitDetailsCalendar(habit);
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

	// Проверка, выполнена ли привычка сегодня
	isTodayCompleted(habit) {
		const today = new Date().toISOString().split("T")[0];
		return habit.completedDays[today] === "completed";
	}

	// Проверка и применение штрафов за невыполненные привычки
	checkDailyPenalties() {
		const today = new Date().toISOString().split("T")[0];
		const lastCheck = localStorage.getItem("lastPenaltyCheck");

		// Проверяем только раз в день
		if (lastCheck === today) return;

		let totalPenalty = 0;
		let penalizedHabits = 0;

		// Проверяем все активные привычки
		this.habits.active.forEach(habit => {
			if (!this.isTodayCompleted(habit)) {
				// Отмечаем как невыполненную и применяем штраф
				habit.completedDays[today] = "failed";
				totalPenalty += 12; // -12 XP за каждую невыполненную привычку
				penalizedHabits++;
			}
		});

		// Применяем штрафы
		if (totalPenalty > 0) {
			this.addExperience(-totalPenalty);
			console.log(
				`Применены штрафы: -${totalPenalty} XP за ${penalizedHabits} невыполненных привычек`
			);
		}

		// Сохраняем дату проверки
		localStorage.setItem("lastPenaltyCheck", today);
		this.saveHabits();
	}

	// Показ уведомления об опыте
	showExperienceNotification(points) {
		const notification = document.createElement("div");
		notification.className = `experience-notification ${
			points > 0 ? "positive" : "negative"
		}`;
		notification.innerHTML = `
			<i class="fas fa-${points > 0 ? "plus" : "minus"}"></i>
			<span>${points > 0 ? "+" : ""}${points} XP</span>
		`;

		document.body.appendChild(notification);

		// Анимация появления
		setTimeout(() => notification.classList.add("show"), 100);

		// Удаление через 3 секунды
		setTimeout(() => {
			notification.classList.remove("show");
			setTimeout(() => notification.remove(), 300);
		}, 3000);
	}

	// Добавление опыта
	addExperience(points) {
		const currentExp = parseInt(localStorage.getItem("totalExperience") || "0");
		const newExp = Math.max(0, currentExp + points);
		localStorage.setItem("totalExperience", newExp.toString());

		// Показываем уведомление
		this.showExperienceNotification(points);
	}

	// Рендеринг календаря для деталей привычки
	renderHabitDetailsCalendar(habit) {
		const calendar = document.getElementById("habitCalendar");
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

	// Рендеринг детальной статистики по дням
	renderDailyStats() {
		this.applyCalendarFilter("month"); // По умолчанию показываем месяц
	}

	// Рендеринг основного календаря статистики
	renderMainStatisticsCalendar() {
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
			const totalActiveHabits = this.habits.active.length;
			const completedCount = dayStats.completed;
			const failedCount = dayStats.failed;

			let classes = "calendar-day";
			if (completedCount > 0 && failedCount === 0) classes += " completed";
			else if (failedCount > 0) classes += " failed";
			if (isToday) classes += " today";

			calendarHTML += `
				<div class="calendar-day ${classes}" 
					 data-date="${dateStr}"
					 onclick="habitTracker.showDayDetails('${dateStr}')">
					<div class="day-number">${day}</div>
					${
						totalActiveHabits > 0
							? `<div class="day-stats">${completedCount}/${totalActiveHabits}</div>`
							: ""
					}
				</div>
			`;
		}

		calendar.innerHTML = calendarHTML;
	}

	// Показать детали дня в модальном окне
	showDayDetails(dateStr) {
		const date = new Date(dateStr);
		const isToday = date.toDateString() === new Date().toDateString();
		
		// Собираем статистику по всем активным привычкам для этого дня
		let completedCount = 0;
		let failedCount = 0;
		let completedHabits = [];
		let failedHabits = [];

		this.habits.active.forEach(habit => {
			const status = habit.completedDays[dateStr];
			if (status === "completed") {
				completedCount++;
				completedHabits.push(habit.name);
			} else if (status === "failed") {
				failedCount++;
				failedHabits.push(habit.name);
			}
		});

		// Создаем модальное окно
		const modalHTML = `
			<div class="modal active" id="dayDetailsModal">
				<div class="modal-content day-details">
					<div class="modal-header">
						<h3>
							<i class="fas fa-calendar-day"></i>
							Статистика за ${date.toLocaleDateString("ru-RU", {
								day: "numeric",
								month: "long",
								weekday: "long",
								year: "numeric"
							})}
						</h3>
						<button class="close-btn" onclick="habitTracker.closeDayDetailsModal()">
							<i class="fas fa-times"></i>
						</button>
					</div>
					<div class="day-details-content">
						${this.generateDayStatsHTML(
							date,
							isToday,
							completedCount,
							failedCount,
							completedHabits,
							failedHabits
						)}
					</div>
				</div>
			</div>
		`;

		// Удаляем существующее модальное окно, если есть
		const existingModal = document.getElementById("dayDetailsModal");
		if (existingModal) {
			existingModal.remove();
		}

		// Добавляем новое модальное окно
		document.body.insertAdjacentHTML("beforeend", modalHTML);
	}

	// Закрыть модальное окно деталей дня
	closeDayDetailsModal() {
		const modal = document.getElementById("dayDetailsModal");
		if (modal) {
			modal.remove();
		}
	}

	// Генерация HTML для статистики дня
	generateDayStatsHTML(
		date,
		isToday,
		completedCount,
		failedCount,
		completedHabits,
		failedHabits
	) {
		const dateFormatted = date.toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			weekday: "long",
		});

		return `
			<div class="daily-stat-card">
				<div class="daily-stat-header">
					<div class="daily-stat-date">${dateFormatted}</div>
					${isToday ? '<span class="today-badge">Сегодня</span>' : ""}
				</div>
				<div class="daily-stat-summary">
					${
						completedCount > 0
							? `
						<div class="daily-stat-item completed">
							<i class="fas fa-check"></i>
							<span>Выполнено: ${completedCount}</span>
						</div>
					`
							: ""
					}
					${
						failedCount > 0
							? `
						<div class="daily-stat-item failed">
							<i class="fas fa-times"></i>
							<span>Провалено: ${failedCount}</span>
						</div>
					`
							: ""
					}
					${
						completedCount === 0 && failedCount === 0
							? `
						<div class="daily-stat-item">
							<i class="fas fa-minus"></i>
							<span>Нет активности</span>
						</div>
					`
							: ""
					}
				</div>
				${
					completedHabits.length > 0 || failedHabits.length > 0
						? `
					<div class="daily-habits-list">
						${completedHabits
							.map(
								name => `
							<div class="daily-habit-item">
								<span class="daily-habit-name">${name}</span>
								<div class="daily-habit-status completed">
									<i class="fas fa-check"></i>
									<span>Выполнено</span>
								</div>
							</div>
						`
							)
							.join("")}
						${failedHabits
							.map(
								name => `
							<div class="daily-habit-item">
								<span class="daily-habit-name">${name}</span>
								<div class="daily-habit-status failed">
									<i class="fas fa-times"></i>
									<span>Провалено</span>
								</div>
							</div>
						`
							)
							.join("")}
					</div>
				`
						: ""
				}
			</div>
		`;
	}

	// Применение фильтра к календарю
	applyCalendarFilter(filter) {
		const container = document.getElementById("dailyStatsContainer");
		const currentDate = new Date();
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		let statsHTML = "";
		let startDate, endDate;

		switch (filter) {
			case "today":
				startDate = new Date(currentDate);
				endDate = new Date(currentDate);
				break;
			case "week":
				// Начало недели (понедельник)
				const dayOfWeek = currentDate.getDay();
				const diff =
					currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
				startDate = new Date(year, month, diff);
				endDate = new Date(startDate);
				endDate.setDate(startDate.getDate() + 6);
				break;
			case "month":
			default:
				startDate = new Date(year, month, 1);
				endDate = new Date(year, month + 1, 0);
				break;
		}

		// Генерируем статистику для выбранного периода
		for (
			let d = new Date(startDate);
			d <= endDate;
			d.setDate(d.getDate() + 1)
		) {
			const date = new Date(d);
			const dateStr = date.toISOString().split("T")[0];
			const isToday = date.toDateString() === currentDate.toDateString();

			// Собираем статистику по всем активным привычкам для этого дня
			let completedCount = 0;
			let failedCount = 0;
			let completedHabits = [];
			let failedHabits = [];

			this.habits.active.forEach(habit => {
				const status = habit.completedDays[dateStr];
				if (status === "completed") {
					completedCount++;
					completedHabits.push(habit.name);
				} else if (status === "failed") {
					failedCount++;
					failedHabits.push(habit.name);
				}
			});

			// Показываем только дни с активностью или сегодня
			if (completedCount > 0 || failedCount > 0 || isToday) {
				statsHTML += this.generateDayStatsHTML(
					date,
					isToday,
					completedCount,
					failedCount,
					completedHabits,
					failedHabits
				);
			}
		}

		container.innerHTML =
			statsHTML || '<p class="empty-state">Нет данных для отображения</p>';
		
		// Обновляем основной календарь при смене фильтра
		if (this.currentTab === "statistics") {
			this.renderMainStatisticsCalendar();
		}
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
										? `<div class="today-checkbox-section">
												<label class="today-checkbox-label">
													<input type="checkbox" class="today-checkbox" data-habit-id="${habit.id}" ${
												this.isTodayCompleted(habit) ? "checked" : ""
										  }>
													<span class="checkbox-custom"></span>
													<span class="checkbox-text">Отметить на сегодня</span>
												</label>
											</div>
											<div class="habit-actions">
												<button class="btn-secondary details-btn">
													<i class="fas fa-info-circle"></i> Детали
												</button>
											</div>`
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

			// Обработчик для чекбокса
			const todayCheckbox = item.querySelector(".today-checkbox");
			if (todayCheckbox) {
				todayCheckbox.addEventListener("change", e => {
					e.stopPropagation();
					const habitId = item.dataset.habitId;
					const habit = this.habits.active.find(h => h.id === habitId);
					if (habit) {
						this.toggleTodayHabit(habit, e.target.checked);
					}
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

	// Получение информации об уровне
	getLevelInfo(totalExp) {
		const levels = [
			{ name: "Новичок", minExp: 0, maxExp: 99, requiredExp: 100 },
			{ name: "Ученик", minExp: 100, maxExp: 499, requiredExp: 500 },
			{ name: "Продвинутый", minExp: 500, maxExp: 999, requiredExp: 1000 },
			{ name: "Мастер", minExp: 1000, maxExp: 1999, requiredExp: 2000 },
			{ name: "Легенда", minExp: 2000, maxExp: 4999, requiredExp: 5000 },
		];

		for (let i = levels.length - 1; i >= 0; i--) {
			if (totalExp >= levels[i].minExp) {
				return {
					...levels[i],
					nextLevel: i < levels.length - 1 ? levels[i + 1] : null,
					currentExp: totalExp - levels[i].minExp,
					progressToNext: levels[i].nextLevel
						? Math.min(
								((totalExp - levels[i].minExp) /
									(levels[i].nextLevel.minExp - levels[i].minExp)) *
									100,
								100
						  )
						: 100,
				};
			}
		}
		return levels[0];
	}

	// Обновление статистики пользователя
	updateUserStats() {
		const totalExp = parseInt(localStorage.getItem("totalExperience") || "0");
		document.getElementById("totalExperience").textContent = `${totalExp} XP`;

		// Получаем информацию об уровне
		const levelInfo = this.getLevelInfo(totalExp);

		// Обновляем прогресс-бар опыта
		const experienceFill = document.getElementById("experienceFill");
		if (experienceFill) {
			experienceFill.style.width = `${levelInfo.progressToNext}%`;
		}

		// Обновляем уровень
		document.getElementById(
			"levelBadge"
		).innerHTML = `<i class="fas fa-medal"></i><span>${levelInfo.name}</span>`;

		// Добавляем информацию о прогрессе к следующему уровню
		const levelBadge = document.getElementById("levelBadge");
		const levelProgress = document.getElementById("levelProgress");

		if (levelInfo.nextLevel) {
			levelBadge.title = `${levelInfo.name} (${levelInfo.currentExp}/${
				levelInfo.nextLevel.minExp - levelInfo.minExp
			} XP)\nСледующий уровень: ${levelInfo.nextLevel.name} (${
				levelInfo.nextLevel.requiredExp
			} XP)`;

			// Обновляем текст прогресса
			if (levelProgress) {
				const progressText = levelProgress.querySelector(".progress-text");
				if (progressText) {
					progressText.textContent = `${levelInfo.currentExp} / ${
						levelInfo.nextLevel.minExp - levelInfo.minExp
					} XP до ${levelInfo.nextLevel.name}`;
				}
			}
		} else {
			levelBadge.title = `${levelInfo.name} - Максимальный уровень!`;

			// Скрываем прогресс для максимального уровня
			if (levelProgress) {
				const progressText = levelProgress.querySelector(".progress-text");
				if (progressText) {
					progressText.textContent = "Максимальный уровень достигнут!";
				}
			}
		}
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
