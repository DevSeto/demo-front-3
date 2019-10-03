interface _createUserDto {
    readonly email: string;
}

type CreateUserDto = _createUserDto;

interface _loginUserDto {
    readonly email: string;
    readonly password: string;
}

type LoginUserDto = _loginUserDto;

interface _FolderDto {
    readonly folder: JSON;
    readonly folder_name: String;
    readonly user_id: String;
}

type FolderDto = _FolderDto;

interface _FileDto {
    readonly nzb_file_id: number;
    readonly user_id: string;
    readonly file_name: string;
    readonly size: number;
    readonly type: string;
}

type FileDto = _FileDto;