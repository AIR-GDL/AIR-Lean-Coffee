# Integración de Pusher - Sincronización en Tiempo Real

## Descripción General

Pusher se ha integrado en la aplicación AIR Lean Coffee para proporcionar sincronización en tiempo real de:
- **Topics**: Creación, actualización, eliminación y cambios de estado
- **Timer**: Inicio, pausa, actualización y detención
- **Usuarios**: Unión, salida, actualización y cambios de votos

## Configuración

### Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```bash
PUSHER_APP_ID=tu_app_id
PUSHER_KEY=tu_key
PUSHER_SECRET=tu_secret
PUSHER_CLUSTER=tu_cluster
```

Obtén estas credenciales desde tu dashboard de Pusher en https://dashboard.pusher.com

## Archivos Creados

### Configuración
- `src/lib/pusher.ts` - Configuración del servidor Pusher
- `src/lib/pusher-client.ts` - Configuración del cliente Pusher

### Contexto
- `src/context/PusherContext.tsx` - Proveedor de contexto para Pusher

### API Routes
- `src/app/api/pusher/auth/route.ts` - Autenticación de canales privados
- `src/app/api/pusher/topics/route.ts` - Disparador de eventos

### Hooks Personalizados
- `src/hooks/usePusherTopics.ts` - Hook para sincronización de topics
- `src/hooks/usePusherTimer.ts` - Hook para sincronización del timer
- `src/hooks/usePusherUsers.ts` - Hook para sincronización de usuarios

## Uso en Componentes

### Escuchar Eventos de Topics

```typescript
import { usePusherTopics } from '@/hooks/usePusherTopics';

export default function MyComponent() {
  usePusherTopics({
    onTopicCreated: (topic) => {
      console.log('Nuevo topic:', topic);
      // Actualizar estado local
    },
    onTopicUpdated: (topic) => {
      console.log('Topic actualizado:', topic);
    },
    onTopicDeleted: (topicId) => {
      console.log('Topic eliminado:', topicId);
    },
    onTopicStatusChanged: (topicId, status) => {
      console.log('Estado del topic cambió a:', status);
    },
  });

  return <div>Contenido</div>;
}
```

### Disparar Eventos de Topics

```typescript
import { triggerTopicEvent } from '@/hooks/usePusherTopics';

// Cuando se crea un topic
await triggerTopicEvent('topic-created', {
  topic: newTopic,
});

// Cuando se actualiza un topic
await triggerTopicEvent('topic-updated', {
  topic: updatedTopic,
});

// Cuando se elimina un topic
await triggerTopicEvent('topic-deleted', {
  topicId: topicId,
});

// Cuando cambia el estado
await triggerTopicEvent('topic-status-changed', {
  topicId: topicId,
  status: 'discussing',
});
```

### Escuchar Eventos del Timer

```typescript
import { usePusherTimer } from '@/hooks/usePusherTimer';

export default function TimerComponent() {
  usePusherTimer({
    onTimerUpdated: (timerData) => {
      console.log('Timer actualizado:', timerData);
    },
    onTimerStarted: (timerData) => {
      console.log('Timer iniciado:', timerData);
    },
    onTimerPaused: (timerData) => {
      console.log('Timer pausado:', timerData);
    },
    onTimerStopped: (topicId) => {
      console.log('Timer detenido para:', topicId);
    },
  });

  return <div>Timer</div>;
}
```

### Disparar Eventos del Timer

```typescript
import { triggerTimerEvent } from '@/hooks/usePusherTimer';

// Cuando inicia el timer
await triggerTimerEvent('timer-started', {
  topicId: topicId,
  remainingSeconds: 300,
  isRunning: true,
  isPaused: false,
  durationMinutes: 5,
});

// Cuando se actualiza el timer
await triggerTimerEvent('timer-updated', {
  topicId: topicId,
  remainingSeconds: 250,
  isRunning: true,
  isPaused: false,
  durationMinutes: 5,
});

// Cuando se pausa el timer
await triggerTimerEvent('timer-paused', {
  topicId: topicId,
  remainingSeconds: 250,
  isRunning: false,
  isPaused: true,
  durationMinutes: 5,
});

// Cuando se detiene el timer
await triggerTimerEvent('timer-stopped', {
  topicId: topicId,
});
```

### Escuchar Eventos de Usuarios

```typescript
import { usePusherUsers } from '@/hooks/usePusherUsers';

export default function UsersComponent() {
  usePusherUsers({
    onUserJoined: (user) => {
      console.log('Usuario se unió:', user.name);
    },
    onUserLeft: (userId) => {
      console.log('Usuario se fue:', userId);
    },
    onUserUpdated: (user) => {
      console.log('Usuario actualizado:', user);
    },
    onVotesUpdated: (userId, votesRemaining) => {
      console.log('Votos actualizados:', votesRemaining);
    },
  });

  return <div>Usuarios</div>;
}
```

### Disparar Eventos de Usuarios

```typescript
import { triggerUserEvent } from '@/hooks/usePusherUsers';

// Cuando un usuario se une
await triggerUserEvent('user-joined', {
  user: newUser,
});

// Cuando un usuario se va
await triggerUserEvent('user-left', {
  userId: userId,
});

// Cuando se actualiza un usuario
await triggerUserEvent('user-updated', {
  user: updatedUser,
});

// Cuando se actualizan los votos
await triggerUserEvent('votes-updated', {
  userId: userId,
  votesRemaining: 3,
});
```

## Canales Disponibles

### Canales Públicos
- `topics` - Eventos relacionados con topics
- `timer` - Eventos del timer
- `users` - Eventos de usuarios

## Integración en Board.tsx

Para integrar completamente Pusher en el componente Board, necesitas:

1. **Importar los hooks**:
```typescript
import { usePusherTopics, triggerTopicEvent } from '@/hooks/usePusherTopics';
import { usePusherTimer, triggerTimerEvent } from '@/hooks/usePusherTimer';
import { usePusherUsers, triggerUserEvent } from '@/hooks/usePusherUsers';
```

2. **Escuchar eventos en el componente**:
```typescript
usePusherTopics({
  onTopicCreated: (topic) => mutate(),
  onTopicUpdated: (topic) => mutate(),
  onTopicDeleted: () => mutate(),
  onTopicStatusChanged: () => mutate(),
});

usePusherTimer({
  onTimerUpdated: (timerData) => {
    // Actualizar estado del timer
  },
});

usePusherUsers({
  onUserJoined: () => mutateUsers(),
  onUserLeft: () => mutateUsers(),
  onVotesUpdated: () => mutateUsers(),
});
```

3. **Disparar eventos cuando se realicen acciones**:
```typescript
// En handleAddTopic
await triggerTopicEvent('topic-created', { topic: newTopic });

// En handleConfirmDiscuss
await triggerTimerEvent('timer-started', { /* datos */ });

// En handleVote
await triggerUserEvent('votes-updated', { /* datos */ });
```

## Monitoreo

Puedes monitorear los eventos en tiempo real desde el dashboard de Pusher:
1. Ve a https://dashboard.pusher.com
2. Selecciona tu aplicación
3. Ve a la sección "Debug Console"
4. Verás todos los eventos en tiempo real

## Troubleshooting

### Conexión no establecida
- Verifica que las credenciales de Pusher sean correctas
- Asegúrate de que el cluster sea el correcto
- Revisa la consola del navegador para errores

### Eventos no se reciben
- Verifica que el nombre del canal sea correcto
- Asegúrate de que el evento se está disparando correctamente
- Revisa el Debug Console de Pusher

### Errores de autenticación
- Verifica que el endpoint `/api/pusher/auth` esté funcionando
- Asegúrate de que el usuario esté autenticado

## Próximos Pasos

1. Integrar los hooks en el componente Board.tsx
2. Probar la sincronización en tiempo real con múltiples usuarios
3. Optimizar el rendimiento si es necesario
4. Agregar manejo de desconexiones y reconexiones
