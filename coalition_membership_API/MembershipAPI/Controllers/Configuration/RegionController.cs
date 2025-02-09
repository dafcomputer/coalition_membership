﻿using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using MembershipImplementation.Services.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MembershipDigitalAPI.Controllers.Configuration
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegionController : ControllerBase
    {

        private readonly IRegionService _regionService;

        public RegionController(IRegionService regionService)
        {
            _regionService = regionService;
        }

       
        [HttpGet]
        [ProducesResponseType(typeof(ResponseMessage<RegionGetDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetRegionList()
        {
            return Ok(await _regionService.GetRegionList());
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage<string>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddRegion([FromBody] RegionPostDto RegionDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _regionService.AddRegion(RegionDto));
            }
            else
            {
                return BadRequest();
            }
        }


        [HttpPut]
        [ProducesResponseType(typeof(ResponseMessage<string>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateRegion(RegionPostDto RegionDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _regionService.UpdateRegion(RegionDto));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpDelete]
        [ProducesResponseType(typeof(ResponseMessage<string>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeleteRegion(Guid regionID)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _regionService.DeleteRegion(regionID));
            }
            else
            {
                return BadRequest();
            }
        }

    }
}
