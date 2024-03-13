/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DragHandleSVG = ({ fill = '#333333' }) => {
  return (
    <svg width="10" height="16">
      <circle cx="2" cy="2" r="2" fill={fill} />
      <circle cx="2" cy="8" r="2" fill={fill} />
      <circle cx="2" cy="14" r="2" fill={fill} />
      <circle cx="8" cy="2" r="2" fill={fill} />
      <circle cx="8" cy="8" r="2" fill={fill} />
      <circle cx="8" cy="14" r="2" fill={fill} />
    </svg>
  )
}

export default DragHandleSVG
