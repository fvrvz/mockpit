package com.ms.utils.moock.mapper;

import com.ms.utils.moock.dto.ResponseHeaderDTO;
import com.ms.utils.moock.domain.ResponseHeader;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface ResponseHeaderMapper {
    ResponseHeaderDTO toDto(ResponseHeader responseHeader);
    ResponseHeader toEntity(ResponseHeaderDTO responseHeaderDTO);

    Set<ResponseHeaderDTO> toDTOList(List<ResponseHeader> headerList);
    Set<ResponseHeader> toEntityList(List<ResponseHeaderDTO> headerDTOList);
}
