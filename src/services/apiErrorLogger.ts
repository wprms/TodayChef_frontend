import type { Middleware } from '@reduxjs/toolkit';

export const apiErrorLogger: Middleware = () => (next) => (action) => next(action);
