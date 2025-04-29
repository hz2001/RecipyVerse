// 这是一个模拟的supabase客户端，后续会替换为真实的API调用

interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

class SupabaseMock {
  // 模拟存储数据
  private db: {
    merchants: any[];
    nfts: any[];
    users: any[];
  } = {
    merchants: [],
    nfts: [],
    users: []
  };

  // 模拟查询构建器
  from(table: string) {
    return {
      select: (columns: string) => {
        return {
          eq: (field: string, value: any) => {
            return {
              single: () => {
                const result = this.db[table as keyof typeof this.db]?.find((item) => item[field] === value);
                return {
                  data: result || null,
                  error: null
                };
              }
            };
          },
          order: (column: string, { ascending }: { ascending: boolean }) => {
            const sortedData = [...(this.db[table as keyof typeof this.db] || [])].sort((a, b) => {
              if (ascending) {
                return a[column] > b[column] ? 1 : -1;
              } else {
                return a[column] < b[column] ? 1 : -1;
              }
            });
            return {
              data: sortedData,
              error: null
            };
          }
        };
      },
      insert: (data: any) => {
        const id = Math.random().toString(36).substring(2, 15);
        const newItem = { id, created_at: new Date().toISOString(), ...data };
        this.db[table as keyof typeof this.db].push(newItem);
        return {
          data: newItem,
          error: null
        };
      },
      update: (data: any) => {
        return {
          eq: (field: string, value: any) => {
            const index = this.db[table as keyof typeof this.db].findIndex((item) => item[field] === value);
            if (index !== -1) {
              this.db[table as keyof typeof this.db][index] = {
                ...this.db[table as keyof typeof this.db][index],
                ...data
              };
              return {
                data: this.db[table as keyof typeof this.db][index],
                error: null
              };
            }
            return {
              data: null,
              error: new Error(`Item with ${field}=${value} not found`)
            };
          }
        };
      }
    };
  }

  // 模拟存储操作
  storage = {
    from: (bucket: string) => {
      return {
        upload: (path: string, file: File) => {
          console.log(`Mock uploading ${file.name} to ${bucket}/${path}`);
          return {
            data: { path },
            error: null
          };
        }
      };
    }
  };
}

export const supabase = new SupabaseMock(); 