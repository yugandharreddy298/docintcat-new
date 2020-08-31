export interface Socket {
    on(event: string, callback: (data: any) => void );
    emit(event: string, data: any);
    disconnect()
    removeAllListeners(event: string)
    _callbacks:any
  }