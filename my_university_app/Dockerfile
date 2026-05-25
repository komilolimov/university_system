# ==========================================
# Этап 1: Сборка (Builder)
# ==========================================
FROM python:3.11-slim as builder

WORKDIR /app

# Устанавливаем системные зависимости для компиляции пакетов (например, psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
  gcc \
  libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Создаем виртуальное окружение, чтобы легко скопировать его на следующем этапе
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копируем только requirements.txt для кэширования слоев Docker
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
  pip install --no-cache-dir -r requirements.txt

# ==========================================
# Этап 2: Финальный образ (Production)
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Устанавливаем только runtime-зависимости (без gcc)
RUN apt-get update && apt-get install -y --no-install-recommends \
  libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Копируем готовое виртуальное окружение из builder'а
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Создаем непривилегированного пользователя для безопасности
RUN useradd -m -d /app -s /bin/bash appuser

# Копируем код проекта и передаем права нашему пользователю
COPY --chown=appuser:appuser src/ ./src/
COPY --chown=appuser:appuser alembic/ ./alembic/
COPY --chown=appuser:appuser alembic.ini .

# Переключаемся на безопасного пользователя
USER appuser

EXPOSE 8000

# По умолчанию запускаем сервер (может быть переопределено в docker-compose)
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]