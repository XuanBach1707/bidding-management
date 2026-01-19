import { http } from '@/shared/api'; 
import { 
  CrawlerLogListItem, 
  CrawlerLogDetail, 
  GetCrawlerLogsParams 
} from '../'; // Trỏ đúng về file chứa types bên trên

const ENDPOINT_LOGS = '/crawler-config/logs';

export const getCrawlerLogs = async (params?: GetCrawlerLogsParams): Promise<CrawlerLogListItem[]> => {
  // params: { status, ruleId } -> Interceptor sẽ tự chuyển thành { status, rule_id }
  return http.get(ENDPOINT_LOGS, { params });
};

export const getCrawlerLogDetail = async (logId: number): Promise<CrawlerLogDetail> => {
  return http.get(`${ENDPOINT_LOGS}/${logId}`);
};