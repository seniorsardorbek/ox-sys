export interface UploadedFileInfo {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

export interface MultipleFilesInfo {
  files: UploadedFileInfo[];
  totalSize: number;
  count: number;
}
